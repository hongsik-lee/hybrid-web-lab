import { showGlobalPageLoader } from "../../src/utils/pageLoader.js"

function resolveTarget() {
  const target = document.body?.dataset?.redirectTarget
  if (!target) return null
  return target
}

function redirectToTarget() {
  const target = resolveTarget()
  if (!target) return

  showGlobalPageLoader()

  window.setTimeout(() => {
    window.location.replace(target)
  }, 180)
}

redirectToTarget()
