import "./styles/main.scss"
import "./utils/pageLoader"

import { loadComponents } from "./utils/componentLoader"

function ensureFloatingHomeButton() {
  if (typeof document === "undefined") return
  if (document.querySelector(".floating-home-btn")) return

  // Resolve landing URL from Vite base path for both local and GitHub Pages.
  const baseUrl = (import.meta.env && import.meta.env.BASE_URL) || "/"

  const button = document.createElement("a")
  button.className = "floating-home-btn"
  button.href = `${baseUrl}landing/index.html`
  button.setAttribute("aria-label", "메인 화면으로 이동")
  button.textContent = "메인"
  document.body.appendChild(button)
}

document.addEventListener("DOMContentLoaded", async () => {

  await loadComponents()
  ensureFloatingHomeButton()

})