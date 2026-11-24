/** @jsxImportSource @opentui/solid */
// Pragma, not tsconfig: the published package ships only src/, so without it
// Bun's default JSX transform imports react and the plugin fails to load.
import { Plugin, usePlugin } from "@opencode/plugin/tui"
import type { Context } from "@opencode/plugin/tui/plugin"
import { onCleanup, createSignal } from "solid-js"
import { PROVIDERS, PeakStatus, fmt, peakStatus, type Provider } from "./peak"
import { TextAttributes } from "@opentui/core"

function Badge() {
  const plugin = usePlugin()
  const theme = plugin.theme
  const [provider, setProvider] = plugin.storage.store<{ id: Provider }>("provider", {
    initial: { id: "deepseek" },
  })
  const [now, setNow] = createSignal(new Date())
  const tick = setInterval(() => setNow(new Date()), 1000)
  onCleanup(() => clearInterval(tick))

  const info = () => PROVIDERS[provider.id]
  const status = () => peakStatus(now(), provider.id)

  const getStatusString = (ps: PeakStatus) => ps.peak ? `${fmt(ps.ms)} left` : `in ${fmt(ps.ms)}`

  const choose = async () => {
    const next = await plugin.ui.dialog.select<Provider>({
      title: "Peak hours provider",
      current: provider.id,
      options: (Object.keys(PROVIDERS) as Provider[]).map((id) => {
        const ps = peakStatus(now(), id);
        return ({
        title: PROVIDERS[id].label,
        description: PROVIDERS[id].description,
        footer: getStatusString(ps),
        category: ps.peak ? 'Peak in progress' : 'No peak',
        value: id,
      })
      }),
    })
    if (next) await setProvider((draft) => { draft.id = next })
  }

  return (
    <box flexDirection="row">
      <text
        fg={provider.id === "zai" ? "#aaaaaa" : "#6c80e8"}
        onMouseUp={() => void choose()}
        attributes={TextAttributes.BOLD}
      >
        {`${info().label} Peak: `}
      </text>
      <text fg={status().peak ? theme.text.feedback.error.base : theme.text.base}>
        {getStatusString(status())}
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
