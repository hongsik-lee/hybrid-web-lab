import "./list.scss"
import { getPosts } from "../../api/api"
import { createPostCard } from "../../components/post-card/post-card"
import { loadComponents } from "../../utils/componentLoader"
import { navigate } from "../../utils/router"

const PAGE_SIZE = 6
let currentPage = 1

const postListContainer = document.getElementById("post-list")
const writeButton = document.getElementById("go-write")
const paginationEl = document.getElementById("pagination")

function bindEvents() {
  if (!writeButton) return
  writeButton.addEventListener("click", () => {
    navigate("/src/pages/write/write.html")
  })
}

function renderPagination(total, page, limit) {
  if (!paginationEl) return

  const totalPages = Math.max(1, Math.ceil(total / limit))
  if (totalPages <= 1) {
    paginationEl.innerHTML = ""
    return
  }

  const createButton = (label, targetPage, disabled = false) => {
    const btn = document.createElement("button")
    btn.type = "button"
    btn.className = "page-btn"
    btn.textContent = label
    btn.disabled = disabled
    btn.addEventListener("click", () => {
      if (disabled) return
      currentPage = targetPage
      renderPosts()
    })
    return btn
  }

  paginationEl.innerHTML = ""
  paginationEl.appendChild(createButton("Prev", page - 1, page <= 1))

  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, page + 2)

  for (let i = start; i <= end; i += 1) {
    const btn = createButton(i.toString(), i, false)
    if (i === page) {
      btn.classList.add("active")
      btn.setAttribute("aria-current", "page")
    }
    paginationEl.appendChild(btn)
  }

  paginationEl.appendChild(createButton("Next", page + 1, page >= totalPages))
}

async function renderPosts() {
  await loadComponents()
  bindEvents()

  const { data: posts, total } = await getPosts({ page: currentPage, limit: PAGE_SIZE })
  if (!postListContainer) return

  postListContainer.innerHTML = ""

  posts.forEach(post => {
    const card = createPostCard(post, () => {
      navigate(`/src/pages/post-detail/detail.html?id=${encodeURIComponent(post.id)}`)
    })

    postListContainer.appendChild(card)
  })

  renderPagination(total, currentPage, PAGE_SIZE)
}

renderPosts()
