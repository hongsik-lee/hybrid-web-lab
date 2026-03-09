const cards = document.querySelectorAll(".card")
const body = document.body

let frameId = null
let targetX = window.innerWidth * 0.5
let targetY = window.innerHeight * 0.3

function updateBackgroundGlow() {
	const mouseXPercent = (targetX / window.innerWidth) * 100
	const mouseYPercent = (targetY / window.innerHeight) * 100

	body.style.setProperty("--mouse-x", `${mouseXPercent}%`)
	body.style.setProperty("--mouse-y", `${mouseYPercent}%`)
	frameId = null
}

window.addEventListener("mousemove", (event) => {
	targetX = event.clientX
	targetY = event.clientY

	if (!frameId) {
		frameId = requestAnimationFrame(updateBackgroundGlow)
	}
})

window.addEventListener("mouseleave", () => {
	targetX = window.innerWidth * 0.5
	targetY = window.innerHeight * 0.3
	if (!frameId) {
		frameId = requestAnimationFrame(updateBackgroundGlow)
	}
})

cards.forEach(card => {

	card.addEventListener("mousemove", (e) => {

		const rect = card.getBoundingClientRect()

		const x = e.clientX - rect.left
		const y = e.clientY - rect.top

		card.style.setProperty("--x", x + "px")
		card.style.setProperty("--y", y + "px")

		const centerX = rect.width / 2
		const centerY = rect.height / 2

		const rotateX = (y - centerY) / 18
		const rotateY = (centerX - x) / 18

		card.style.transform =
			`rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`

	})

	card.addEventListener("mouseleave", () => {

		card.style.transform = ""

	})

})