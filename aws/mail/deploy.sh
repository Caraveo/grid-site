#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-1}"
STACK_NAME="${STACK_NAME:-grid-mail}"
SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$(mktemp -d)"
trap 'rm -rf "$BUILD_DIR"' EXIT

if [[ -z "${GRID_MAIL_API_SECRET:-}" ]]; then
  echo "GRID_MAIL_API_SECRET must be set in the environment." >&2
  exit 1
fi

cp "$SOURCE_DIR/handler.py" "$BUILD_DIR/handler.py"
(
  cd "$BUILD_DIR"
  python3 -m zipfile -c mail-handler.zip handler.py
)

aws cloudformation deploy \
  --region "$AWS_REGION" \
  --stack-name "$STACK_NAME" \
  --template-file "$SOURCE_DIR/template.yaml" \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    MailDomain=gridmail.dev \
    SystemSender=hi@gridmail.dev \
    MailApiSecret="$GRID_MAIL_API_SECRET"

FUNCTION_NAME="$(aws cloudformation describe-stacks \
  --region "$AWS_REGION" \
  --stack-name "$STACK_NAME" \
  --query "Stacks[0].Outputs[?OutputKey=='MailFunctionName'].OutputValue" \
  --output text)"

aws lambda update-function-code \
  --region "$AWS_REGION" \
  --function-name "$FUNCTION_NAME" \
  --zip-file "fileb://$BUILD_DIR/mail-handler.zip" >/dev/null

aws lambda update-function-configuration \
  --region "$AWS_REGION" \
  --function-name "$FUNCTION_NAME" \
  --handler handler.lambda_handler >/dev/null

aws ses set-active-receipt-rule-set \
  --region "$AWS_REGION" \
  --rule-set-name gridmail-inbound

aws cloudformation describe-stacks \
  --region "$AWS_REGION" \
  --stack-name "$STACK_NAME" \
  --query "Stacks[0].Outputs" \
  --output table
