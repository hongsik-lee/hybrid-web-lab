const STYLE_ID = "global-page-loader-style"
const LOADER_ID = "global-page-loader"
const SHOW_DELAY_MS = 180

let initialized = false
let showTimerId = null

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return

  const style = document.createElement("style")
  style.id = STYLE_ID
  style.textContent = `
    #${LOADER_ID} {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: grid;
      place-items: center;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity 260ms ease, visibility 260ms ease;
      background:
        radial-gradient(680px circle at 15% 20%, rgba(120, 80, 255, 0.4), transparent 58%),
        radial-gradient(620px circle at 84% 18%, rgba(0, 210, 255, 0.28), transparent 55%),
        radial-gradient(560px circle at 50% 80%, rgba(255, 90, 200, 0.2), transparent 58%),
        linear-gradient(140deg, #120920 0%, #0a1333 52%, #0b1f3a 100%);
      backdrop-filter: blur(5px);
    }

    #${LOADER_ID}.is-visible {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    #${LOADER_ID} .loader-shell {
      display: grid;
      justify-items: center;
      gap: 14px;
      text-align: center;
      color: #f5f8ff;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    #${LOADER_ID} .loader-ring {
      width: 84px;
      height: 84px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.18);
      border-top-color: rgba(255, 255, 255, 0.95);
      border-right-color: rgba(98, 216, 255, 0.9);
      box-shadow:
        0 0 20px rgba(136, 166, 255, 0.38),
        0 0 40px rgba(90, 140, 255, 0.2);
      animation: global-loader-spin 0.92s linear infinite;
    }

    #${LOADER_ID} .loader-text {
      font-size: 14px;
      opacity: 0.9;
    }

    @keyframes global-loader-spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #${LOADER_ID},
      #${LOADER_ID} .loader-ring {
        animation: none !important;
        transition: none !important;
      }
    }
  `

  document.head.appendChild(style)
}

function ensureLoader() {
  let overlay = document.getElementById(LOADER_ID)
  if (overlay) return overlay

  overlay = document.createElement("div")
  overlay.id = LOADER_ID
  overlay.setAttribute("aria-live", "polite")
  overlay.setAttribute("aria-busy", "true")
  overlay.innerHTML = `
    <div class="loader-shell" role="status" aria-label="페이지 로딩 중">
      <span class="loader-ring" aria-hidden="true"></span>
      <p class="loader-text">페이지를 불러오는 중입니다</p>
    </div>
  `

  document.body.appendChild(overlay)
  return overlay
}

function showLoader(immediate = false) {
  const overlay = ensureLoader()

  if (showTimerId) {
    window.clearTimeout(showTimerId)
    showTimerId = null
  }

  const reveal = () => {
    overlay.classList.add("is-visible")
  }

  if (immediate) {
    reveal()
    return
  }

  showTimerId = window.setTimeout(() => {
    reveal()
  }, SHOW_DELAY_MS)
}

function hideLoader() {
  if (showTimerId) {
    window.clearTimeout(showTimerId)
    showTimerId = null
  }

  const overlay = ensureLoader()
  overlay.classList.remove("is-visible")
}

function isLocalPageNavigation(anchor, event) {
  if (!anchor) return false
  if (event.defaultPrevented) return false
  if (event.button !== 0) return false
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false
  if (anchor.hasAttribute("download")) return false

  const target = (anchor.getAttribute("target") || "").toLowerCase()
  if (target && target !== "_self") return false

  const href = anchor.getAttribute("href") || ""
  if (!href || href.startsWith("#") || href.startsWith("javascript:")) return false

  const url = new URL(href, window.location.href)
  if (url.origin !== window.location.origin) return false

  const sameDocumentWithoutReload =
    url.pathname === window.location.pathname &&
    url.search === window.location.search &&
    url.hash !== window.location.hash

  if (sameDocumentWithoutReload) return false

  return true
}

function bindNavigationSignals() {
  document.addEventListener(
    "click",
    (event) => {
      const anchor = event.target.closest("a[href]")
      if (!isLocalPageNavigation(anchor, event)) return
      showLoader(true)
    },
    true
  )

  document.addEventListener(
    "submit",
    (event) => {
      const form = event.target
      if (!(form instanceof HTMLFormElement)) return

      const target = (form.getAttribute("target") || "").toLowerCase()
      if (target && target !== "_self") return

      showLoader(true)
    },
    true
  )

  window.addEventListener("pageshow", () => {
    hideLoader()
  })
}

function init() {
  if (initialized) return
  if (typeof window === "undefined" || typeof document === "undefined") return

  initialized = true

  ensureStyle()

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        ensureLoader()
      },
      { once: true }
    )
  } else {
    ensureLoader()
  }

  showLoader(false)

  window.addEventListener(
    "load",
    () => {
      hideLoader()
    },
    { once: true }
  )

  if (document.readyState === "complete") {
    hideLoader()
  }

  bindNavigationSignals()

  window.__globalPageLoader = {
    show: () => showLoader(true),
    hide: hideLoader
  }
}

init()

export function showGlobalPageLoader() {
  showLoader(true)
}

export function hideGlobalPageLoader() {
  hideLoader()
}
