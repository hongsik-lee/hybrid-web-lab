import "./styles/main.scss"

import { loadComponents } from "./utils/componentLoader"

function ensureFloatingHomeButton() {
  if (typeof document === "undefined") return
  if (document.querySelector(".floating-home-btn")) return

  const button = document.createElement("a")
  button.className = "floating-home-btn"
  button.href = "/landing/index.html"
  button.setAttribute("aria-label", "메인 화면으로 이동")
  button.textContent = "메인"
  document.body.appendChild(button)
}

document.addEventListener("DOMContentLoaded", async () => {

  await loadComponents()
  ensureFloatingHomeButton()

})