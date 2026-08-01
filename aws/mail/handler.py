import base64
import boto3
import email
import hashlib
import hmac
import json
import os
import re
import uuid
from datetime import datetime, timezone
from email import policy
from email.message import EmailMessage
from email.utils import getaddresses, parseaddr
from urllib.parse import parse_qs

BUCKET = os.environ["MAIL_BUCKET"]
TABLE_NAME = os.environ["MAIL_TABLE"]
DOMAIN = os.environ.get("MAIL_DOMAIN", "gridmail.dev").lower()
SYSTEM_SENDER = os.environ.get("SYSTEM_SENDER", f"hi@{DOMAIN}")
API_SECRET = os.environ["MAIL_API_SECRET"]

s3 = boto3.client("s3")
ses = boto3.client("sesv2")
table = boto3.resource("dynamodb").Table(TABLE_NAME)


def response(status, payload):
    return {
        "statusCode": status,
        "headers": {
            "content-type": "application/json",
            "cache-control": "no-store",
            "x-content-type-options": "nosniff",
        },
        "body": json.dumps(payload, default=str),
    }


def clean_address(value):
    address = parseaddr(str(value or ""))[1].strip().lower()
    if len(address) > 254 or not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", address):
        raise ValueError("invalid email address")
    return address


def mailbox_address(value):
    address = clean_address(value)
    if not address.endswith(f"@{DOMAIN}"):
        raise ValueError("mailbox is outside configured domain")
    return address


def addresses(header_values):
    return [
        {"name": name, "email": address.lower()}
        for name, address in getaddresses(header_values or [])
        if address
    ]


def normalized_subject(subject):
    return re.sub(r"^(\s*(re|fwd?|aw):\s*)+", "", subject or "", flags=re.I).strip().lower()


def thread_id(subject, participants):
    seed = normalized_subject(subject) + "|" + "|".join(sorted(set(participants)))
    return hashlib.sha256(seed.encode()).hexdigest()[:32]


def text_parts(message):
    plain = ""
    html = ""
    attachments = []
    if message.is_multipart():
        for part in message.walk():
            disposition = part.get_content_disposition()
            content_type = part.get_content_type()
            if disposition == "attachment" or part.get_filename():
                attachments.append(part)
            elif content_type == "text/plain" and not plain:
                plain = part.get_content()
            elif content_type == "text/html" and not html:
                html = part.get_content()
    else:
        if message.get_content_type() == "text/html":
            html = message.get_content()
        else:
            plain = message.get_content()
    return str(plain)[:500000], str(html)[:500000], attachments


def store_message(raw, envelope_recipients, direction="inbound"):
    message = email.message_from_bytes(raw, policy=policy.default)
    message_id = str(message.get("Message-ID") or "").strip("<>") or hashlib.sha256(raw).hexdigest()
    timestamp = datetime.now(timezone.utc).isoformat()
    subject = str(message.get("Subject") or "")
    sender_name, sender_email = parseaddr(str(message.get("From") or ""))
    to = addresses(message.get_all("To", []))
    cc = addresses(message.get_all("Cc", []))
    recipients = sorted(set(clean_address(value) for value in envelope_recipients))
    participants = [sender_email.lower()] + [entry["email"] for entry in to + cc]
    conversation = thread_id(subject, participants)
    plain, html, attachment_parts = text_parts(message)
    attachment_meta = []

    for index, part in enumerate(attachment_parts):
        payload = part.get_payload(decode=True) or b""
        attachment_id = hashlib.sha256(
            f"{message_id}:{index}:{part.get_filename()}".encode()
        ).hexdigest()[:32]
        key = f"attachments/{message_id}/{attachment_id}"
        s3.put_object(
            Bucket=BUCKET,
            Key=key,
            Body=payload,
            ContentType=part.get_content_type(),
            ServerSideEncryption="AES256",
        )
        attachment_meta.append({
            "attachment_id": attachment_id,
            "filename": part.get_filename() or f"attachment-{index + 1}",
            "content_type": part.get_content_type(),
            "size": len(payload),
            "s3_key": key,
        })

    item = {
        "message_id": message_id,
        "thread_id": conversation,
        "timestamp": timestamp,
        "subject": subject[:998],
        "from": {"name": sender_name, "email": sender_email.lower()},
        "to": to,
        "cc": cc,
        "text": plain,
        "html": html,
        "preview": (plain or re.sub(r"<[^>]+>", " ", html))[:240],
        "direction": direction,
        "folder": "inbox" if direction == "inbound" else "sent",
        "is_read": direction != "inbound",
        "attachments": attachment_meta,
        "raw_s3_key": f"raw/{message_id}" if direction == "inbound" else "",
    }
    for recipient in recipients:
        if not recipient.endswith(f"@{DOMAIN}"):
            continue
        stored = dict(item)
        stored.update({
            "mailbox": recipient,
            "item_key": f"MSG#{timestamp}#{message_id}",
            "thread_key": f"{recipient}#{conversation}",
        })
        table.put_item(Item=stored)
    return item


def handle_ses(event):
    for record in event.get("Records", []):
        ses_record = record.get("ses", {})
        mail = ses_record.get("mail", {})
        receipt = ses_record.get("receipt", {})
        message_id = mail.get("messageId")
        if not message_id:
            continue
        raw = s3.get_object(Bucket=BUCKET, Key=f"raw/{message_id}")["Body"].read()
        store_message(raw, receipt.get("recipients", []))
    return {"disposition": "CONTINUE"}


def authorized(event):
    headers = {str(k).lower(): str(v) for k, v in (event.get("headers") or {}).items()}
    supplied = headers.get("x-grid-mail-secret", "")
    return hmac.compare_digest(supplied.encode(), API_SECRET.encode())


def request_data(event):
    if not event.get("body"):
        return {}
    raw = event["body"]
    if event.get("isBase64Encoded"):
        raw = base64.b64decode(raw).decode()
    return json.loads(raw)


def query_messages(mailbox, limit=100):
    result = table.query(
        KeyConditionExpression=boto3.dynamodb.conditions.Key("mailbox").eq(mailbox)
        & boto3.dynamodb.conditions.Key("item_key").begins_with("MSG#"),
        ScanIndexForward=False,
        Limit=min(max(int(limit), 1), 200),
    )
    return result.get("Items", [])


def find_message(mailbox, message_id):
    for item in query_messages(mailbox, 200):
        if item.get("message_id") == message_id:
            return item
    return None


def send_message(mailbox, data):
    recipients = [clean_address(value) for value in data.get("to", [])][:50]
    if not recipients:
        raise ValueError("recipient required")
    cc = [clean_address(value) for value in data.get("cc", [])][:50]
    bcc = [clean_address(value) for value in data.get("bcc", [])][:50]
    subject = str(data.get("subject", ""))[:998]
    plain = str(data.get("text", ""))[:500000]
    html = str(data.get("html", ""))[:500000]
    content = {"Simple": {
        "Subject": {"Data": subject, "Charset": "UTF-8"},
        "Body": {"Text": {"Data": plain or " ", "Charset": "UTF-8"}},
    }}
    if html:
        content["Simple"]["Body"]["Html"] = {"Data": html, "Charset": "UTF-8"}
    destination = {"ToAddresses": recipients}
    if cc:
        destination["CcAddresses"] = cc
    if bcc:
        destination["BccAddresses"] = bcc
    result = ses.send_email(
        FromEmailAddress=mailbox,
        Destination=destination,
        Content=content,
    )
    now = datetime.now(timezone.utc).isoformat()
    message_id = result["MessageId"]
    participants = [mailbox] + recipients + cc
    conversation = thread_id(subject, participants)
    item = {
        "mailbox": mailbox,
        "item_key": f"MSG#{now}#{message_id}",
        "thread_key": f"{mailbox}#{conversation}",
        "thread_id": conversation,
        "message_id": message_id,
        "timestamp": now,
        "subject": subject,
        "from": {"name": "", "email": mailbox},
        "to": [{"name": "", "email": address} for address in recipients],
        "cc": [{"name": "", "email": address} for address in cc],
        "text": plain,
        "html": html,
        "preview": plain[:240],
        "direction": "outbound",
        "folder": "sent",
        "is_read": True,
        "attachments": [],
    }
    table.put_item(Item=item)
    return item


def handle_api(event):
    if not authorized(event):
        return response(401, {"error": "unauthorized"})
    headers = {str(k).lower(): str(v) for k, v in (event.get("headers") or {}).items()}
    mailbox = mailbox_address(headers.get("x-grid-mailbox") or SYSTEM_SENDER)
    context = event.get("requestContext", {}).get("http", {})
    method = context.get("method", "GET")
    path = context.get("path", "/")
    query = event.get("queryStringParameters") or {}

    try:
        if method == "GET" and path.endswith("/threads"):
            messages = query_messages(mailbox)
            search = str(query.get("q", "")).lower().strip()
            folder = str(query.get("folder", "inbox")).lower().strip()
            if folder not in ("inbox", "sent", "archive", "trash", "all"):
                folder = "inbox"
            if folder != "all":
                messages = [
                    item for item in messages
                    if str(item.get(
                        "folder",
                        "sent" if item.get("direction") == "outbound" else "inbox",
                    )) == folder
                ]
            if search:
                messages = [
                    item for item in messages
                    if search in str(item.get("subject", "")).lower()
                    or search in str(item.get("text", "")).lower()
                    or search in json.dumps(item.get("from", {})).lower()
                ]
            threads = {}
            for item in messages:
                thread = threads.setdefault(item["thread_id"], dict(item))
                thread["message_count"] = int(thread.get("message_count", 0)) + 1
                thread["unread_count"] = int(thread.get("unread_count", 0)) + (
                    0 if item.get("is_read", False) else 1
                )
            return response(200, {
                "threads": list(threads.values()),
                "folder": folder,
            })

        if method == "GET" and path.endswith("/thread"):
            thread = str(query.get("id", ""))
            result = table.query(
                IndexName="ThreadIndex",
                KeyConditionExpression=boto3.dynamodb.conditions.Key("thread_key").eq(
                    f"{mailbox}#{thread}"
                ),
                ScanIndexForward=True,
            )
            messages = result.get("Items", [])
            return response(200, {
                "thread_id": thread,
                "subject": messages[-1].get("subject", "") if messages else "",
                "messages": messages,
            })

        if method == "GET" and path.endswith("/drafts"):
            result = table.query(
                KeyConditionExpression=boto3.dynamodb.conditions.Key("mailbox").eq(mailbox)
                & boto3.dynamodb.conditions.Key("item_key").begins_with("DRAFT#"),
                ScanIndexForward=False,
                Limit=100,
            )
            return response(200, {"drafts": result.get("Items", [])})

        if method == "GET" and path.endswith("/attachment"):
            message_id = str(query.get("message", ""))
            attachment_id = str(query.get("attachment", ""))
            for item in query_messages(mailbox, 200):
                if item.get("message_id") != message_id:
                    continue
                attachment = next(
                    (entry for entry in item.get("attachments", [])
                     if entry.get("attachment_id") == attachment_id),
                    None,
                )
                if not attachment:
                    break
                url = s3.generate_presigned_url(
                    "get_object",
                    Params={
                        "Bucket": BUCKET,
                        "Key": attachment["s3_key"],
                        "ResponseContentDisposition": f'attachment; filename="{attachment["filename"]}"',
                    },
                    ExpiresIn=60,
                )
                return response(200, {"url": url})
            return response(404, {"error": "attachment not found"})

        data = request_data(event)
        if method == "POST" and path.endswith("/thread/action"):
            thread = str(data.get("threadId", ""))
            action = str(data.get("action", "")).lower()
            if not thread:
                raise ValueError("thread id required")
            result = table.query(
                IndexName="ThreadIndex",
                KeyConditionExpression=boto3.dynamodb.conditions.Key("thread_key").eq(
                    f"{mailbox}#{thread}"
                ),
            )
            messages = result.get("Items", [])
            if not messages:
                return response(404, {"error": "thread not found"})
            if action in ("archive", "trash", "restore"):
                folder = {
                    "archive": "archive",
                    "trash": "trash",
                    "restore": "inbox",
                }[action]
                with table.batch_writer() as batch:
                    for item in messages:
                        item["folder"] = folder
                        batch.put_item(Item=item)
            elif action in ("read", "unread"):
                with table.batch_writer() as batch:
                    for item in messages:
                        item["is_read"] = action == "read"
                        batch.put_item(Item=item)
            elif action == "delete":
                if any(str(item.get("folder", "")) != "trash" for item in messages):
                    raise ValueError("move the conversation to trash before deleting it")
                with table.batch_writer() as batch:
                    for item in messages:
                        for attachment in item.get("attachments", []):
                            key = attachment.get("s3_key")
                            if key:
                                s3.delete_object(Bucket=BUCKET, Key=key)
                        batch.delete_item(Key={
                            "mailbox": mailbox,
                            "item_key": item["item_key"],
                        })
            else:
                raise ValueError("unknown thread action")
            return response(200, {
                "ok": True,
                "thread_id": thread,
                "action": action,
            })

        if method == "POST" and path.endswith("/draft"):
            now = datetime.now(timezone.utc).isoformat()
            draft_id = str(data.get("draft_id") or uuid.uuid4())
            item = {
                "mailbox": mailbox,
                "item_key": f"DRAFT#{now}#{draft_id}",
                "thread_key": f"{mailbox}#DRAFT#{draft_id}",
                "thread_id": f"DRAFT#{draft_id}",
                "timestamp": now,
                "draft_id": draft_id,
                "to": [clean_address(value) for value in data.get("to", [])][:50],
                "subject": str(data.get("subject", ""))[:998],
                "text": str(data.get("text", ""))[:500000],
            }
            table.put_item(Item=item)
            return response(200, item)

        if method == "POST" and (
            path.endswith("/send")
            or path.endswith("/reply")
            or path.endswith("/reply-all")
            or path.endswith("/forward")
        ):
            if path.endswith("/reply") or path.endswith("/reply-all"):
                original = find_message(mailbox, str(data.get("messageId", "")))
                if not original:
                    return response(404, {"error": "original message not found"})
                reply_to = original.get("from", {}).get("email")
                recipients = [reply_to] if reply_to else []
                if path.endswith("/reply-all"):
                    recipients.extend(
                        entry.get("email") for entry in
                        original.get("to", []) + original.get("cc", [])
                        if entry.get("email") and entry.get("email") != mailbox
                    )
                data["to"] = list(dict.fromkeys(recipients))
                subject = str(original.get("subject", ""))
                data["subject"] = subject if subject.lower().startswith("re:") else f"Re: {subject}"
            elif path.endswith("/forward"):
                original = find_message(mailbox, str(data.get("messageId", "")))
                if not original:
                    return response(404, {"error": "original message not found"})
                subject = str(original.get("subject", ""))
                data["subject"] = subject if subject.lower().startswith("fwd:") else f"Fwd: {subject}"
                sender = original.get("from", {}).get("email", "")
                original_text = str(original.get("text", ""))
                note = str(data.get("text", ""))
                data["text"] = (
                    f"{note}\n\n---------- Forwarded message ----------\n"
                    f"From: {sender}\nSubject: {subject}\n\n{original_text}"
                )
            return response(200, send_message(mailbox, data))

        if method == "GET" and path.endswith("/health"):
            return response(200, {"ok": True, "domain": DOMAIN})

        return response(404, {"error": "unknown mail operation"})
    except ValueError as exc:
        return response(400, {"error": str(exc)})
    except Exception as exc:
        print(json.dumps({"event": "mail_api_error", "error": str(exc)}))
        return response(500, {"error": "mail operation failed"})


def lambda_handler(event, context):
    if event.get("Records") and event["Records"][0].get("eventSource") == "aws:ses":
        return handle_ses(event)
    return handle_api(event)
