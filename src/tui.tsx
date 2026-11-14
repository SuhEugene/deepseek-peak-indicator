import { Plugin } from "@opencode/plugin/tui"
import type { Context } from "@opencode/plugin/tui/plugin"
import { onCleanup, createSignal } from "solid-js"
import type { ResolvedTheme } from "@opencode/theme/tui"
import { fmt, peakStatus } from "./peak"

function Badge(props: { theme: ResolvedTheme }) {
  const [now, setNow] = createSignal(new Date())
  const tick = setInterval(() => setNow(new Date()), 1000)
  onCleanup(() => clearInterval(tick))

  const status = () => peakStatus(now())
  return (
    <box flexDirection="row">
      <text fg={props.theme.hue.blue[100]}>Deepseek Peak: </text>
      <text fg={status().peak ? props.theme.text.feedback.error.base : props.theme.text.base}>
        {status().peak ? `${fmt(status().ms)} left` : `in ${fmt(status().ms)}`}
      </text>
    </box>
  )
}

export default Plugin.define({
  id: "deepseek-peak",
  setup(context: Context) {
    const theme = context.theme
    context.ui.slot({
      append: "sidebar.content",
      render: () => <Badge theme={theme} />,
    })
  },
})
