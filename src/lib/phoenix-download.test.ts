import assert from "node:assert/strict";
import test from "node:test";
import {
  choosePhoenixDownload,
  type PhoenixBrowserSignals,
} from "./phoenix-download";

const mac: PhoenixBrowserSignals = {
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/140 Safari/537.36",
  platform: "MacIntel",
  maxTouchPoints: 0,
};

test("selects the Intel macOS release from client hints", () => {
  const choice = choosePhoenixDownload({ ...mac, architecture: "x86" });
  assert.equal(choice.platform, "macOS 13+ · Intel");
  assert.match(choice.href, /macOS-x86_64\.zip$/);
});

test("selects the Apple silicon release from client hints", () => {
  const choice = choosePhoenixDownload({ ...mac, architecture: "arm" });
  assert.equal(choice.platform, "macOS 13+ · Apple silicon");
  assert.match(choice.href, /macOS-aarch64\.zip$/);
});

test("uses Apple GPU evidence when client hints are unavailable", () => {
  const choice = choosePhoenixDownload({
    ...mac,
    webglRenderer: "ANGLE Metal Renderer: Apple M3",
  });
  assert.match(choice.href, /macOS-aarch64\.zip$/);
});

test("uses Intel GPU evidence when client hints are unavailable", () => {
  const choice = choosePhoenixDownload({
    ...mac,
    webglRenderer: "Intel(R) Iris(TM) Plus Graphics 655",
  });
  assert.match(choice.href, /macOS-x86_64\.zip$/);
});

test("does not guess when a Mac browser hides the architecture", () => {
  const choice = choosePhoenixDownload(mac);
  assert.equal(choice.label, "Get Phoenix Wallet");
  assert.equal(choice.href, "https://grid-compute.com/phoenix");
  assert.match(choice.platform, /choose Intel or Apple silicon/);
});

test("recognizes iPad desktop mode instead of treating it as a Mac", () => {
  const choice = choosePhoenixDownload({
    ...mac,
    maxTouchPoints: 5,
  });
  assert.equal(choice.platform, "iOS · coming soon");
  assert.equal(choice.mobile, true);
});

test("does not offer an x86 Linux binary to ARM64 Linux", () => {
  const choice = choosePhoenixDownload({
    userAgent: "Mozilla/5.0 (X11; Linux aarch64) Chrome/140 Safari/537.36",
    platform: "Linux aarch64",
    maxTouchPoints: 0,
    architecture: "arm64",
  });
  assert.equal(choice.label, "Get Phoenix Wallet");
  assert.equal(choice.platform, "Linux ARM64 · build unavailable");
});
