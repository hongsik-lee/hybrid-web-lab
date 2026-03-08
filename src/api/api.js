const ENV_API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const BASE_URL = ENV_API_BASE_URL || "http://localhost:3000"

const LOCAL_DB_KEY = "ai-board-local-db-v1"
const DEFAULT_LOCAL_DB = {
  posts: [
    {
      id: "local-1",
      title: "환영합니다 👋",
      author: "AI Board",
      content: "배포 URL에서는 브라우저 저장소(localStorage) 기반으로 데이터가 동작합니다.",
      date: new Date().toISOString(),
    },
  ],
  comments: [],
}

// If VITE_API_BASE_URL is not set, always use local mode to avoid
// localhost fetch retries and delayed UI rendering in dev.
const shouldForceLocalMode = typeof window !== "undefined" && !ENV_API_BASE_URL

function createId(prefix = "id") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

function normalizePagedResponse(json, fallbackTotal = 0) {
  if (Array.isArray(json)) {
    return {
      data: json,
      total: fallbackTotal || json.length,
    }
  }

  return {
    data: Array.isArray(json?.data) ? json.data : [],
    total: Number(json?.items ?? fallbackTotal ?? 0),
  }
}

function sortByDateDesc(list) {
  return [...list].sort((a, b) => {
    const aTime = Date.parse(a?.date ?? "")
    const bTime = Date.parse(b?.date ?? "")

    if (!Number.isNaN(aTime) && !Number.isNaN(bTime)) {
      return bTime - aTime
    }

    return String(b?.id ?? "").localeCompare(String(a?.id ?? ""))
  })
}

function paginate(list, { page = 1, limit = 10 } = {}) {
  const safePage = Math.max(1, Number(page) || 1)
  const safeLimit = Math.max(1, Number(limit) || 10)
  const start = (safePage - 1) * safeLimit
  const end = start + safeLimit
  const sorted = sortByDateDesc(list)

  return {
    data: sorted.slice(start, end),
    total: sorted.length,
  }
}

function readLocalDb() {
  if (typeof localStorage === "undefined") {
    return { ...DEFAULT_LOCAL_DB }
  }

  try {
    const raw = localStorage.getItem(LOCAL_DB_KEY)
    if (!raw) {
      localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(DEFAULT_LOCAL_DB))
      return { ...DEFAULT_LOCAL_DB }
    }

    const parsed = JSON.parse(raw)
    return {
      posts: Array.isArray(parsed?.posts) ? parsed.posts : [...DEFAULT_LOCAL_DB.posts],
      comments: Array.isArray(parsed?.comments) ? parsed.comments : [],
    }
  } catch {
    return { ...DEFAULT_LOCAL_DB }
  }
}

function writeLocalDb(db) {
  if (typeof localStorage === "undefined") return
  localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db))
}

async function tryRemoteJson(url, options) {
  const res = await fetch(url, options)
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`)
  }
  return res
}

export async function getPosts({ page = 1, limit = 10 } = {}) {
  if (!shouldForceLocalMode) {
    try {
      const url = new URL(`${BASE_URL}/posts`)
      url.searchParams.set("_page", page)
      url.searchParams.set("_per_page", limit)

      const res = await tryRemoteJson(url.toString())
      const headerTotal = Number(res.headers.get("X-Total-Count") ?? 0)
      const json = await res.json()
      const { data, total } = normalizePagedResponse(json, headerTotal)

      return { data: sortByDateDesc(data), total }
    } catch {
      // local fallback
    }
  }

  const db = readLocalDb()
  return paginate(db.posts, { page, limit })
}

export async function getPost(id) {
  if (!shouldForceLocalMode) {
    try {
      const res = await tryRemoteJson(`${BASE_URL}/posts/${id}`)
      return res.json()
    } catch {
      // local fallback
    }
  }

  const db = readLocalDb()
  return db.posts.find((post) => String(post.id) === String(id)) ?? null
}

export async function createPost(post) {
  const payload = {
    ...post,
    id: post.id ?? createId("post"),
    author: post.author || "익명",
    date: post.date || new Date().toISOString(),
  }

  if (!shouldForceLocalMode) {
    try {
      const res = await tryRemoteJson(`${BASE_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      return res.json()
    } catch {
      // local fallback
    }
  }

  const db = readLocalDb()
  db.posts.push(payload)
  writeLocalDb(db)
  return payload
}

export async function getComments(postId, { page = 1, limit = 10 } = {}) {
  if (!shouldForceLocalMode) {
    try {
      const url = new URL(`${BASE_URL}/comments`)
      url.searchParams.set("postId", postId)
      url.searchParams.set("_page", page)
      url.searchParams.set("_per_page", limit)

      const res = await tryRemoteJson(url.toString())
      const headerTotal = Number(res.headers.get("X-Total-Count") ?? 0)
      const json = await res.json()
      const { data, total } = normalizePagedResponse(json, headerTotal)

      return { data: sortByDateDesc(data), total }
    } catch {
      // local fallback
    }
  }

  const db = readLocalDb()
  const comments = db.comments.filter((comment) => String(comment.postId) === String(postId))
  return paginate(comments, { page, limit })
}

export async function createComment(comment) {
  const payload = {
    ...comment,
    id: comment.id ?? createId("comment"),
    postId: String(comment.postId),
    author: comment.author || "익명",
    date: comment.date || new Date().toISOString(),
  }

  if (!shouldForceLocalMode) {
    try {
      const res = await tryRemoteJson(`${BASE_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      return res.json()
    } catch {
      // local fallback
    }
  }

  const db = readLocalDb()
  db.comments.push(payload)
  writeLocalDb(db)
  return payload
}
