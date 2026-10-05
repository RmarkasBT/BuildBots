// Message-kind renderer registry. Cards register here; Message reads it.
// Lives in its own file so Message.jsx exports only components.
export const RENDERERS = {}

export function registerRenderer(kind, Component) {
  RENDERERS[kind] = Component
}
