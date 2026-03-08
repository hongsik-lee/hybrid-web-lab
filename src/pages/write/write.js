import "./write.scss"
import { loadComponents } from "../../utils/componentLoader"
import { createPost } from "../../api/api"
import { navigate } from "../../utils/router"

const form = document.getElementById("write-form")
const messageEl = document.querySelector(".form-message")

function setMessage(text, isError = false) {
  if (!messageEl) return
  messageEl.textContent = text
  messageEl.classList.toggle("error", isError)
  messageEl.classList.toggle("success", !isError)
}

function validate(values) {
  const errors = []
  if (!values.title.trim()) errors.push("제목을 입력해주세요.")
  if (!values.content.trim()) errors.push("내용을 입력해주세요.")
  return errors
}

async function handleSubmit(event) {
  event.preventDefault()

  if (!form) return

  const formData = new FormData(form)
  const values = {
    title: formData.get("title")?.toString() ?? "",
    content: formData.get("content")?.toString() ?? "",
  }

  const errors = validate(values)
  if (errors.length) {
    setMessage(errors.join(" "), true)
    return
  }

  try {
    await createPost({
      title: values.title,
      content: values.content,
      date: new Date().toISOString(),
      author: "익명",
    })

    setMessage("게시물이 정상 등록되었습니다.")

    setTimeout(() => {
      navigate("/src/pages/post-list/list.html")
    }, 600)
  } catch (error) {
    setMessage("등록에 실패했습니다. 다시 시도해주세요.", true)
    console.error(error)
  }
}

async function initWritePage() {
  await loadComponents()

  if (!form) return
  form.addEventListener("submit", handleSubmit)
}

initWritePage()
