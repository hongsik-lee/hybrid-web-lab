import "./header.scss"
import { PAGE_ROUTES, buildPageUrl } from "../../utils/router"

function getCurrentSection(pathname) {
	if (pathname.includes("/post-list/") || pathname.includes("/post-detail/")) {
		return "posts"
	}
	if (pathname.includes("/write/")) {
		return "write"
	}
	if (pathname.includes("/mypage/")) {
		return "mypage"
	}
	if (pathname.includes("/profile/")) {
		return "profile"
	}
	if (pathname.includes("/login/")) {
		return "login"
	}
	return "dashboard"
}

function highlightCurrentMenu() {
	const section = getCurrentSection(window.location.pathname)
	const links = document.querySelectorAll('header[data-component="header"] .menu-nav a')

	const routeBySection = {
		dashboard: PAGE_ROUTES.dashboard,
		posts: PAGE_ROUTES.posts,
		write: PAGE_ROUTES.write,
		mypage: PAGE_ROUTES.mypage,
		profile: PAGE_ROUTES.profile,
		login: PAGE_ROUTES.login,
	}

	links.forEach((link) => {
		const routePath = routeBySection[link.dataset.section]
		if (routePath) {
			link.setAttribute("href", buildPageUrl(routePath))
		}

		const isActive = link.dataset.section === section
		link.classList.toggle("active", isActive)

		if (isActive) {
			link.setAttribute("aria-current", "page")
		} else {
			link.removeAttribute("aria-current")
		}
	})
}

document.body.classList.add("with-sidebar-nav")
highlightCurrentMenu()