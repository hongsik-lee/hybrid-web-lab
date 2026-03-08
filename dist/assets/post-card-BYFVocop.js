function c(e,n){const t=document.createElement("div");t.className="post-card",t.tabIndex=0,t.dataset.postId=e.id,t.innerHTML=`
    <h3 class="title">${e.title}</h3>
    <div class="meta">
      <span class="author">${e.author}</span>
      <span class="date">${e.date}</span>
    </div>
    <p class="excerpt">${e.content?e.content.slice(0,120):""}</p>
  `;const s=()=>{if(typeof n=="function"){n(e);return}const a=`/src/pages/post-detail/detail.html?id=${encodeURIComponent(e.id)}`;window.location.href=a};return t.addEventListener("click",s),t.addEventListener("keypress",a=>{(a.key==="Enter"||a.key===" ")&&s()}),t}export{c as createPostCard};
