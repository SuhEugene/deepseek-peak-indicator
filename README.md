# @suheugene/deepseek-peak-indicator

An [OpenCode](https://opencode.ai) TUI plugin that shows a DeepSeek off-peak
badge in the sidebar:

```
Deepseek Peak: in 02:41    ← off-peak, next peak window in 2h41m (green)
Deepseek Peak: 00:22 left  ← peak window ends in 22 min (red)
```

`Deepseek Peak:` is blue; `in HH:MM` is green; `HH:MM left` is red. Hours can
exceed 24 (e.g. Friday evening shows the gap to Monday 01:00 UTC).

## When is peak?

Per the [official DeepSeek pricing](https://api-docs.deepseek.com/quick_start/pricing):
peak hours are **01:00–04:00 and 06:00–10:00 UTC, Monday through Friday,
excluding Chinese public holidays**. All other hours are off-peak (half price),
including weekends and holidays in full.

Holidays are hardcoded in `src/peak.ts`: 2026 is official (State Council
notice, Nov 2025); 2027 is projected until the State Council publishes its
notice — update the table when it lands.

## Install

```jsonc
// ~/.config/opencode/opencode.json(c)
{
  "plugin": ["/path/to/this/directory"]
}
```

## Develop

```bash
bun install
bunx tsc --noEmit
```
