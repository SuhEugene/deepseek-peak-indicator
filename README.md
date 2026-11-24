# @suheugene/deepseek-peak-indicator

An [OpenCode](https://opencode.ai) TUI plugin that shows an off-peak badge for
DeepSeek or Z.ai in the sidebar:

```
Deepseek Peak: in 02h 41m   ← off-peak, next peak window in 2h 41m (green)
Deepseek Peak: 22m left     ← peak window ends in 22 min (red)
Z.ai Peak: in 02h 41m       ← same badge, Z.ai peak hours, muted label
```

`Deepseek Peak:` is blue, `Z.ai Peak:` is muted; `in HHh MMm` is green;
`MMm left` is red. Gaps longer than a day show as `Xd Hh` (e.g. Friday evening
shows the gap to Monday 01:00 UTC).

Click the provider name to pick DeepSeek or Z.ai in a dialog; the choice is
stored and survives restarts.

## When is peak?

DeepSeek, per the [official pricing](https://api-docs.deepseek.com/quick_start/pricing):
peak hours are **01:00–04:00 and 06:00–10:00 UTC, Monday through Friday,
excluding Chinese public holidays**. All other hours are off-peak (half price),
including weekends and holidays in full.

Z.ai: peak hours are **14:00–18:00 Singapore time (UTC+8), Monday through
Friday** — 06:00–10:00 UTC. No holiday exceptions are documented.

DeepSeek holidays are hardcoded in `src/peak.ts`: 2026 is official (State
Council notice, Nov 2025); 2027 is projected until the State Council publishes
its notice — update the table when it lands.

## Install

```jsonc
// ~/.config/opencode/opencode.json(c)
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["@suheugene/deepseek-peak-indicator"]
}
```

## Develop

```bash
bun install
bunx tsc --noEmit
```
