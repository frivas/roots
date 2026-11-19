---
name: macos-rules
description: "macOS-specific patterns: launchd agent configuration, brew vs pip, zsh regex quirks, file descriptor limits."
---

# macOS Development

## pip on macOS

Respect externally managed Python environments (PEP 668). For a required CLI,
prefer its verified Homebrew formula or use pipx for a verified Python app.
For project libraries, use the project's virtual environment and declared
requirements.

Before installing, verify the exact package name and publisher against the
intended tool's official documentation. Never install a literal placeholder
from an example or infer a package name from a tool's display name. Use the
approved private registry for internal packages.

## zsh Regex and Special Characters

Wrong -- complex regex in zsh triggers parse errors:

```bash
grep -oP '(?<=version":")[^"]+' package.json
# zsh: event not found
```

Right -- use built-in Grep tool, or wrap in bash:

```bash
bash -c 'grep -oP '"'"'(?<=version":")[^"]+'"'"' package.json'
```

## launchd Agent Configuration

Wrong -- run script directly (crashes if dir has .Codex/):

```xml
<key>ProgramArguments</key>
<array>
  <string>/project/scripts/agent.sh</string>
</array>
```

Right -- bash wrapper + resource limits + environment vars:

```xml
<key>ProgramArguments</key>
<array>
  <string>/bin/bash</string>
  <string>-c</string>
  <string>exec /bin/bash /project/scripts/agent.sh</string>
</array>
<key>HardResourceLimits</key>
<dict><key>NumberOfFiles</key><integer>122880</integer></dict>
<key>SoftResourceLimits</key>
<dict><key>NumberOfFiles</key><integer>122880</integer></dict>
<key>EnvironmentVariables</key>
<dict>
  <key>HOME</key><string>/Users/you</string>
  <key>TERM</key><string>xterm-256color</string>
  <key>PATH</key><string>/usr/local/bin:/usr/bin:/bin</string>
</dict>
```

launchd runs with no TTY, so an interactive OAuth login hangs forever.
Generate a non-interactive token first and have the agent script use it:

```bash
Codex setup-token
```

## launchd Testing

Wrong -- test from terminal (masks launchd-specific failures):

```bash
./scripts/agent.sh  # works in terminal, fails silently under launchd
```

Right -- test with launchctl:

```bash
launchctl start com.yourorg.agent
launchctl list | grep yourorg  # exit code shows 0 even on crash -- check logs, not just this
```

The exit code is 0 even when the agent crashed with "Unexpected" -- launchd
testing must inspect log output, not just `launchctl list`'s status column.
