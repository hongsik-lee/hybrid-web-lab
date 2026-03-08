import "./post-card.scss"

export function createPostCard(post, onClick) {
  const template = document.createElement("div")
  template.className = "post-card"
  template.tabIndex = 0
  template.dataset.postId = post.id
  template.innerHTML = `
    <h3 class="title">${post.title}</h3>
    <div class="meta">
      <span class="author">${post.author}</span>
      <span class="date">${post.date}</span>
    </div>
    <p class="excerpt">${post.content ? post.content.slice(0, 120) : ""}</p>
  `

  const navigateToDetail = () => {
    if (typeof onClick === "function") {
      onClick(post)
      return
    }
    const url = `/src/pages/post-detail/detail.html?id=${encodeURIComponent(post.id)}`
    window.location.href = url
  }

  template.addEventListener("click", navigateToDetail)
  template.addEventListener("keypress", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      navigateToDetail()
    }
  })

  return template
}
