import "./detail.scss"
import { loadComponents } from "../../utils/componentLoader"
import { getPost, getComments, createComment } from "../../api/api"
import { navigate } from "../../utils/router"

const detailContainer = document.getElementById("post-detail")
const messageEl = document.querySelector(".detail-message")
const backButton = document.getElementById("back")
const commentList = document.getElementById("comment-list")
const commentForm = document.getElementById("comment-form")

function setMessage(text, isError = false) {
  if (!messageEl) return
  messageEl.textContent = text
  messageEl.classList.toggle("error", isError)
  messageEl.classList.toggle("success", !isError)
}

function getPostIdFromSearch() {
  const params = new URLSearchParams(window.location.search)
  return params.get("id")
}

function formatDate(value) {
  try {
    const date = new Date(value)
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return value
  }
}

function renderCommentItem(comment) {
  const wrapper = document.createElement("div")
  wrapper.className = "comment"
  wrapper.innerHTML = `
    <div class="comment-meta">
      <span class="comment-author">${comment.author || "익명"}</span>
      <span class="comment-date">${formatDate(comment.date)}</span>
    </div>
    <div class="comment-body">${comment.text}</div>
  `
  return wrapper
}

async function renderComments(postId) {
  if (!commentList) return
  commentList.innerHTML = ""

  try {
    const { data: comments } = await getComments(postId, { page: 1, limit: 10 })
    if (!comments.length) {
      commentList.innerHTML = "<p class=\"no-comments\">댓글이 없습니다.</p>"
      return
    }

    comments.forEach(comment => {
      commentList.appendChild(renderCommentItem(comment))
    })
  } catch (e) {
    console.error(e)
    commentList.innerHTML = "<p class=\"no-comments\">댓글을 불러오지 못했습니다.</p>"
  }
}

async function handleCommentSubmit(event) {
  event.preventDefault()
  if (!commentForm) return

  const id = getPostIdFromSearch()
  if (!id) return

  const formData = new FormData(commentForm)
  const text = formData.get("comment")?.toString().trim() ?? ""

  if (!text) {
    setMessage("댓글을 입력해주세요.", true)
    return
  }

  try {
    await createComment({
      postId: String(id),
      text,
      author: "익명",
      date: new Date().toISOString(),
    })

    commentForm.reset()
    await renderComments(id)
  } catch (error) {
    console.error(error)
    setMessage("댓글 등록에 실패했습니다.", true)
  }
}

async function renderDetail() {
  const id = getPostIdFromSearch()
  if (!id) {
    setMessage("잘못된 요청입니다.", true)
    return
  }

  setMessage("로딩 중...")

  try {
    const post = await getPost(id)
    if (!post || !post.id) {
      setMessage("게시물을 찾을 수 없습니다.", true)
      return
    }

    const titleEl = detailContainer.querySelector(".detail-title")
    const authorEl = detailContainer.querySelector(".author")
    const dateEl = detailContainer.querySelector(".date")
    const contentEl = detailContainer.querySelector(".detail-content")

    titleEl.textContent = post.title
    authorEl.textContent = post.author
    dateEl.textContent = formatDate(post.date)
    contentEl.textContent = post.content

    setMessage("")
    await renderComments(id)
  } catch (error) {
    console.error(error)
    setMessage("불러오기에 실패했습니다.", true)
  }
}

async function initDetailPage() {
  await loadComponents()

  if (backButton) {
    backButton.addEventListener("click", () => {
      navigate("/src/pages/post-list/list.html")
    })
  }

  if (commentForm) {
    commentForm.addEventListener("submit", handleCommentSubmit)
  }

  await renderDetail()
}

initDetailPage()
