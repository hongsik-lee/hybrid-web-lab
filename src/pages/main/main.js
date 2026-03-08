import "./main.scss"
import { getPosts } from "../../api/api"
import { navigate } from "../../utils/router"

const STORAGE_KEY = "dashboard-checklist-items"

const goWriteButton = document.getElementById("go-write")
const goPostListButton = document.getElementById("go-post-list")
const totalPostCountEl = document.getElementById("total-post-count")
const latestPostTitleEl = document.getElementById("latest-post-title")
const pendingCheckCountEl = document.getElementById("pending-check-count")
const recentPostListEl = document.getElementById("recent-post-list")

const addCheckButton = document.getElementById("add-check-btn")
const checklistForm = document.getElementById("checklist-form")
const checkInput = document.getElementById("check-input")
const checklistItemsEl = document.getElementById("checklist-items")

let checklistItems = []

function loadChecklist() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) return []
		const parsed = JSON.parse(raw)
		return Array.isArray(parsed) ? parsed : []
	} catch {
		return []
	}
}

function saveChecklist() {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(checklistItems))
}

function updatePendingCount() {
	const pendingCount = checklistItems.filter((item) => !item.done).length
	if (pendingCheckCountEl) {
		pendingCheckCountEl.textContent = `${pendingCount}개`
	}
}

function renderChecklist() {
	if (!checklistItemsEl) return
	checklistItemsEl.innerHTML = ""

	if (!checklistItems.length) {
		checklistItemsEl.innerHTML = `<li class="empty">아직 체크리스트가 없습니다.</li>`
		updatePendingCount()
		return
	}

	checklistItems.forEach((item) => {
		const li = document.createElement("li")
		li.className = "check-item"

		const label = document.createElement("label")

		const checkbox = document.createElement("input")
		checkbox.type = "checkbox"
		checkbox.checked = Boolean(item.done)
		checkbox.addEventListener("change", () => {
			item.done = checkbox.checked
			saveChecklist()
			renderChecklist()
		})

		const text = document.createElement("span")
		text.textContent = item.text
		if (item.done) {
			text.classList.add("done")
		}

		const removeButton = document.createElement("button")
		removeButton.type = "button"
		removeButton.className = "remove-btn"
		removeButton.textContent = "×"
		removeButton.addEventListener("click", () => {
			checklistItems = checklistItems.filter((checkItem) => checkItem.id !== item.id)
			saveChecklist()
			renderChecklist()
		})

		label.appendChild(checkbox)
		label.appendChild(text)
		li.appendChild(label)
		li.appendChild(removeButton)
		checklistItemsEl.appendChild(li)
	})

	updatePendingCount()
}

function addChecklistItem() {
	if (!checkInput) return

	const text = checkInput.value.trim()
	if (!text) {
		checkInput.focus()
		return
	}

	checklistItems.unshift({
		id: crypto.randomUUID(),
		text,
		done: false,
	})

	checkInput.value = ""
	saveChecklist()
	renderChecklist()
}

function bindEvents() {
	if (goWriteButton) {
		goWriteButton.addEventListener("click", () => {
			navigate("/src/pages/write/write.html")
		})
	}

	if (goPostListButton) {
		goPostListButton.addEventListener("click", () => {
			navigate("/src/pages/post-list/list.html")
		})
	}

	if (addCheckButton) {
		addCheckButton.addEventListener("click", addChecklistItem)
	}

	if (checklistForm) {
		checklistForm.addEventListener("submit", (event) => {
			event.preventDefault()
			addChecklistItem()
		})
	}
}

async function renderRecentPosts() {
	if (!recentPostListEl) return

	try {
		const { data: posts, total } = await getPosts({ page: 1, limit: 5 })

		if (totalPostCountEl) {
			totalPostCountEl.textContent = `${total}개`
		}

		if (latestPostTitleEl) {
			latestPostTitleEl.textContent = posts[0]?.title ?? "아직 글이 없어요"
		}

		recentPostListEl.innerHTML = ""

		if (!posts.length) {
			recentPostListEl.innerHTML = `<li class="empty">등록된 게시글이 없습니다.</li>`
			return
		}

		posts.forEach((post) => {
			const item = document.createElement("li")
			item.className = "recent-post-item"

			const titleButton = document.createElement("button")
			titleButton.type = "button"
			titleButton.className = "recent-title"
			titleButton.textContent = post.title
			titleButton.addEventListener("click", () => {
				navigate(`/src/pages/post-detail/detail.html?id=${encodeURIComponent(post.id)}`)
			})

			const meta = document.createElement("p")
			meta.className = "recent-meta"
			meta.textContent = `${post.author || "익명"} · ${post.date || "날짜 없음"}`

			item.appendChild(titleButton)
			item.appendChild(meta)
			recentPostListEl.appendChild(item)
		})
	} catch {
		if (totalPostCountEl) totalPostCountEl.textContent = "-"
		if (latestPostTitleEl) latestPostTitleEl.textContent = "불러오기 실패"
		recentPostListEl.innerHTML = `<li class="empty">게시글을 불러오지 못했습니다.</li>`
	}
}

async function initDashboard() {
	checklistItems = loadChecklist()
	bindEvents()
	renderChecklist()
	await renderRecentPosts()
}

initDashboard()
