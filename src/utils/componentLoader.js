const componentTemplates = import.meta.glob("/src/components/**/*.html", {
  query: "?raw",
  import: "default",
})
const componentScripts = import.meta.glob("/src/components/**/*.js")

export async function loadComponents() {
  const elements = document.querySelectorAll("[data-component]")

  for (const el of elements) {
    const name = el.dataset.component
    const htmlPath = `/src/components/${name}/${name}.html`
    const jsPath = `/src/components/${name}/${name}.js`
    const templateLoader = componentTemplates[htmlPath]

    if (typeof templateLoader === "function") {
      const html = await templateLoader()
      el.innerHTML = html
    }

    // JS 로드 (Vite import.meta.glob 사용)
    try {
      const loader = componentScripts[jsPath]
      if (typeof loader === "function") {
        await loader()
      }
    } catch {}

  }
}
