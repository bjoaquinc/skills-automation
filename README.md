# Skills CLI Automation

Automates the `npx skills` CLI interaction using `node-pty` to programmatically control interactive terminal sessions.

## Features

- Automates the entire `npx skills add mcp-use/skills` workflow
- Handles multi-step CLI interactions (skill selection, agent selection, installation options)
- Uses pseudo-terminal (PTY) for realistic terminal emulation
- Supports keyboard shortcuts (ENTER, SPACE, arrow keys)

## Prerequisites

- Node.js 18+ (tested with v24.4.0)
- macOS, Linux, or Windows with WSL
- Build tools for native modules (node-gyp)

## Installation

```bash
npm install
```

If you encounter issues with `node-pty`, rebuild it:

```bash
npx node-gyp rebuild --directory=node_modules/node-pty
```

## Usage

Run the automation script:

```bash
npm start
```

This will:
1. Clone the skills repository
2. Select the `chatgpt-app-builder` skill
3. Install to all agents (Claude Code, Codex, Cursor, OpenCode)
4. Use project scope installation
5. Create symlinks (recommended method)
6. Complete the installation

## Project Structure

```
skills-automation/
├── src/
│   ├── automate-skills.ts    # Main automation script
│   └── test-pty.ts           # Basic PTY test
├── package.json
├── tsconfig.json
└── README.md
```

## How It Works

The script uses the `CLI` class to:
- Spawn a pseudo-terminal process with `node-pty`
- Buffer output and wait for specific text patterns
- Send keyboard input (space, enter, arrow keys)
- Automate the entire interactive CLI flow

### Key Components

```typescript
class CLI {
  async expect(text: string, timeout = 15000)  // Wait for text to appear
  write(data: string)                           // Send raw input
  enter()                                       // Send ENTER key
  space()                                       // Send SPACE key
  down(times = 1)                               // Send DOWN arrow
  up(times = 1)                                 // Send UP arrow
}
```

## Customization

Edit `src/automate-skills.ts` to customize:
- Which skills to install
- Which agents to target
- Installation scope (project vs global)
- Installation method (symlink vs copy)

Example - selecting different skills:

```typescript
await cli.expect("Select skills to install");
cli.down();     // Move to second option
cli.space();    // Select it
cli.enter();    // Confirm
```

## Troubleshooting

### Error: posix_spawnp failed

This means `node-pty` native module isn't properly built. Run:

```bash
npx node-gyp rebuild --directory=node_modules/node-pty
```

### Timeout errors

Increase the timeout in `expect()` calls if your network is slow:

```typescript
await cli.expect("Select skills to install", 30000);  // 30 seconds
```

### Wrong selections

The CLI might have different default selections. Update the automation logic in `run()` to match the actual CLI behavior.

## Development

Run TypeScript directly:

```bash
npx tsx src/automate-skills.ts
```

Build the project:

```bash
npm run build
```

## License

ISC
