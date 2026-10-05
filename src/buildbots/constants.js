// Product name is a working name — swap it here and nowhere else.
export const PRODUCT_NAME = 'Buildbots'
export const TAGLINE = `${PRODUCT_NAME} know construction, and they know your business.`

// Layout widths at 1440 (desktop only, no responsive work).
export const ROSTER_W = 260
export const RAIL_W = 64
export const LIVE_W = 480
export const LIVE_EXPANDED_VW = 80

// Z layers, documented in one place. Modal.jsx from the main app sits at z-50.
export const Z = {
  liveScrim: 'z-30',
  liveOverlay: 'z-40',
  panel: 'z-50',
  devDrawer: 'z-[60]',
}

// Default authored pacing (ms). Instant responses read as fake.
export const DEFAULT_BOT_DELAY = 900
export const DEFAULT_USER_DELAY = 0

export const DEV_DRAWER_SHORTCUT = { key: 'd', meta: true, shift: true }
