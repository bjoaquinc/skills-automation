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
      process.stdout.write(data);
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

async function runCustom() {
  const cli = new CLI("npx", ["skills", "add", "mcp-use/skills"]);

  // Wait for skills selection
  await cli.expect("Select skills to install");

  // Select mcp-builder (second option)
  cli.down();       // Move down to mcp-builder
  cli.space();      // Select it
  cli.enter();      // Confirm

  // Wait for agent selection
  await cli.expect("Select agents to install skills to");

  // Deselect all agents first (they're selected by default)
  cli.space();      // Deselect Claude Code
  cli.down();
  cli.space();      // Deselect Codex
  cli.down();
  cli.space();      // Deselect Cursor
  cli.down();
  cli.space();      // Deselect OpenCode

  // Now select only Claude Code
  cli.up(3);        // Go back up to Claude Code
  cli.space();      // Select it
  cli.enter();      // Confirm

  // Installation scope - select Global
  await cli.expect("Installation scope");
  cli.down();       // Move to Global
  cli.enter();      // Confirm

  // Installation method - select Copy
  await cli.expect("Installation method");
  cli.down();       // Move to "Copy to all agents"
  cli.enter();      // Confirm

  // Confirm installation
  await cli.expect("Proceed with installation");
  cli.enter();      // Yes

  // Wait for completion
  await cli.expect("Installation Summary");
  console.log("\n✔ Custom CLI automation complete");

  await cli.close();
}

// Example: Run with custom options
runCustom().catch(err => {
  console.error("\n✖ Error:", err.message);
  process.exit(1);
});
