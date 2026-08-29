import { cn, Tip, useQuery } from '@hermes/plugin-sdk'
import { jsx, jsxs } from 'react/jsx-runtime'

const ID = 'chatgpt-usage'
const QUERY_KEY = [ID, 'usage']

function remainingLabel(window) {
  if (window?.remaining_percent === null || window?.remaining_percent === undefined) {
    return '—'
  }

  return `${window.remaining_percent}%`
}

function resetLabel(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return `Reinicia: ${date.toLocaleString()}`
}

function UsagePane({ query }) {
  const { data, error, isLoading, refetch } = query
  const windows = data?.windows ?? []
  const content = isLoading
    ? 'Consultando la cuota de OpenAI Codex…'
    : error
      ? `No se pudo consultar la cuota: ${error instanceof Error ? error.message : String(error)}`
      : !data?.available
        ? data?.reason ?? 'La cuota de OpenAI Codex no está disponible.'
        : windows.length === 0
          ? 'OpenAI no ha devuelto ventanas de consumo para esta cuenta.'
          : null

  return jsxs('section', {
    className: 'flex h-full flex-col gap-3 p-3 text-sm',
    children: [
      jsxs('div', {
        className: 'flex items-center justify-between gap-2',
        children: [
          jsx('div', { className: 'font-medium', children: 'Uso de ChatGPT / Codex' }),
          jsx('button', {
            className: cn(
              'rounded px-2 py-1 text-xs text-(--ui-text-secondary)',
              'hover:bg-(--chrome-action-hover) hover:text-foreground'
            ),
            type: 'button',
            onClick: () => void refetch(),
            children: 'Actualizar'
          })
        ]
      }),
      content
        ? jsx('p', { className: 'text-(--ui-text-tertiary)', children: content })
        : jsxs('div', {
            className: 'flex flex-col gap-2',
            children: windows.map((window, index) =>
              jsxs(
                'div',
                {
                  className: 'rounded border border-(--ui-stroke-secondary) p-2',
                  children: [
                    jsxs('div', {
                      className: 'flex items-baseline justify-between gap-2',
                      children: [
                        jsx('span', { className: 'text-(--ui-text-secondary)', children: window.label ?? 'Límite' }),
                        jsx('strong', { children: remainingLabel(window) })
                      ]
                    }),
                    window.detail ? jsx('div', { className: 'mt-1 text-xs text-(--ui-text-tertiary)', children: window.detail }) : null,
                    resetLabel(window.reset_at)
                      ? jsx('div', { className: 'mt-1 text-xs text-(--ui-text-quaternary)', children: resetLabel(window.reset_at) })
                      : null
                  ]
                },
                `${window.label ?? 'limit'}-${window.reset_at ?? index}`
              )
            )
          }),
      data?.fetched_at
        ? jsx('p', { className: 'mt-auto text-xs text-(--ui-text-quaternary)', children: `Actualizado: ${new Date(data.fetched_at).toLocaleString()}` })
        : null
    ]
  })
}

function UsageChip({ query }) {
  const { data, error, isLoading } = query
  const primary = data?.windows?.[0]
  const label = isLoading ? 'Codex…' : error || !data?.available ? 'Codex: ?' : `Codex: ${remainingLabel(primary)}`
  const tooltip = error
    ? 'No se pudo consultar la cuota de Codex'
    : data?.available
      ? 'Cuota restante de OpenAI Codex'
      : data?.reason ?? 'Cuota de Codex no disponible'

  return jsx(Tip, {
    label: tooltip,
    children: jsx('span', {
      className: 'inline-flex h-full items-center px-1.5 text-[0.6875rem] text-(--ui-text-tertiary)',
      children: label
    })
  })
}

export default {
  id: ID,
  name: 'ChatGPT Usage',
  description: 'Muestra la cuota restante de OpenAI Codex/ChatGPT.',
  register(ctx) {
    const options = {
      queryKey: QUERY_KEY,
      queryFn: () => ctx.rest('/usage', { timeoutMs: 10_000 }),
      refetchInterval: 45_000,
      retry: 1
    }

    function Pane() {
      return jsx(UsagePane, { query: useQuery(options) })
    }

    function Chip() {
      return jsx(UsageChip, { query: useQuery(options) })
    }

    ctx.register({
      id: 'pane',
      area: 'panes',
      title: 'Uso de ChatGPT',
      data: { placement: 'right', width: '280px' },
      render: () => jsx(Pane, {})
    })
    ctx.register({
      id: 'chip',
      area: 'statusBar.right',
      order: 130,
      render: () => jsx(Chip, {})
    })
  }
}
