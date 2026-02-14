import * as pty from "node-pty";

const ENTER = "\r";
const SPACE = " ";
const DOWN = "\x1b[B";
const UP = "\x1b[A";

class CLI {
  buffer = "";
  proc: pty.IPty;

  constructor(command: string, args: string[] = []) {
    this.proc = pty.spawn(command, args, {
      cols: 100,
      rows: 40,
      cwd: process.cwd(),
      env: process.env,
    });

    this.proc.onData(data => {
      this.buffer += data;
      // Suppressed: process.stdout.write(data);
    });
  }

  async expect(text: string, timeout = 15000) {
    const start = Date.now();
    while (!this.buffer.includes(text)) {
      if (Date.now() - start > timeout) {
        throw new Error(`Timeout waiting for: ${text}`);
      }
      await new Promise(r => setTimeout(r, 50));
    }
  }

  write(data: string) {
    this.proc.write(data);
  }

  enter() {
    this.write(ENTER);
  }

  space() {
    this.write(SPACE);
  }

  down(times = 1) {
    for (let i = 0; i < times; i++) {
      this.write(DOWN);
    }
  }

  up(times = 1) {
    for (let i = 0; i < times; i++) {
      this.write(UP);
    }
  }

  async close() {
    return new Promise<void>((resolve) => {
      this.proc.onExit(() => resolve());
      this.proc.kill();
    });
  }
}

async function run() {
  const cli = new CLI("npx", ["--yes", "skills", "add", "mcp-use/skills"]);

  await cli.expect("Select skills to install");
  cli.space();          // select chatgpt-app-builder
  cli.down();
  cli.space();
  cli.enter();

  await cli.expect("Which agents do you want to install to?");
  // All agents are selected by default, just press enter
  cli.enter();

  await cli.expect("Installation scope");
  cli.enter();          // Project or default

  await cli.expect("Installation method");
  cli.down();          // Move to "Copy to all agents"
  cli.enter();          // Confirm

  await cli.expect("Proceed with installation");
  cli.enter();          // Yes

  await cli.expect("Installation Summary");
  console.log("\n✔ CLI automation complete");

  // Omit this since the process will exit when the CLI is done
  // await cli.close();
}

run().catch(err => {
  console.error("\n✖ Error:", err.message);
  process.exit(1);
});
