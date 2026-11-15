/** @jsxImportSource @opentui/solid */
// Pragma, not tsconfig: the published package ships only src/, so without it
// Bun's default JSX transform imports react and the plugin fails to load.
import { Plugin, usePlugin } from "@opencode/plugin/tui"
import type { Context } from "@opencode/plugin/tui/plugin"
import { onCleanup, createSignal } from "solid-js"
import { fmt, peakStatus } from "./peak"

function Badge() {
  const theme = usePlugin().theme
  const [now, setNow] = createSignal(new Date())
  const tick = setInterval(() => setNow(new Date()), 1000)
  onCleanup(() => clearInterval(tick))

  const status = () => peakStatus(now())
  return (
    <box flexDirection="row">
      <text fg="#6c80e8">Deepseek Peak: </text>
      <text fg={status().peak ? theme.text.feedback.error.base : theme.text.base}>
        {status().peak ? `${fmt(status().ms)} left` : `in ${fmt(status().ms)}`}
      </text>
    </box>
  )
}

export default Plugin.define({
  id: "deepseek-peak-indicator",
  setup(context: Context) {
    context.ui.slot({
      append: "sidebar.content",
      render: () => <Badge />,
    })
  },
})
