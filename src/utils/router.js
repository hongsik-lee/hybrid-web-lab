export const PAGE_ROUTES = {
  dashboard: "/src/pages/main/main.html",
  posts: "/src/pages/post-list/list.html",
  postDetail: "/src/pages/post-detail/detail.html",
  write: "/src/pages/write/write.html",
  login: "/src/pages/login/login.html",
  mypage: "/src/pages/mypage/mypage.html",
  profile: "/src/pages/profile/profile.html",
}

function withBase(path) {
  if (/^https?:\/\//.test(path)) {
    return path
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const base = import.meta.env.BASE_URL || "/"

  if (base === "/") {
    return normalizedPath
  }

  const trimmedBase = base.endsWith("/") ? base.slice(0, -1) : base
  return `${trimmedBase}${normalizedPath}`
}

export function buildPageUrl(routeOrPath, queryParams) {
  const rawPath = PAGE_ROUTES[routeOrPath] ?? routeOrPath
  const url = new URL(withBase(rawPath), window.location.origin)

  if (queryParams && typeof queryParams === "object") {
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      url.searchParams.set(key, String(value))
    })
  }

  return `${url.pathname}${url.search}${url.hash}`
}

export function navigate(routeOrPath, queryParams) {
  window.location.href = buildPageUrl(routeOrPath, queryParams)
}