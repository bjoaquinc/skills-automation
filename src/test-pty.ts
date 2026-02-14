import * as pty from "node-pty";

console.log("Testing node-pty...");

const proc = pty.spawn("echo", ["hello"], {
  cols: 100,
  rows: 40,
  cwd: process.cwd(),
  env: process.env,
});

proc.onData(data => {
  console.log("Output:", data);
});

proc.onExit(({ exitCode }) => {
  console.log("Exit code:", exitCode);
  process.exit(0);
});

setTimeout(() => {
  console.log("Timeout - killing process");
  proc.kill();
  process.exit(1);
}, 5000);
