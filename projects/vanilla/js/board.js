// Board JavaScript

// Mock data for posts
const mockPosts = [
    {
        id: 1,
        title: 'Vanilla JS 프로젝트에 오신 것을 환영합니다',
        author: '관리자',
        date: '2026-03-08',
        views: 125,
        content: `Vanilla JavaScript 프로젝트에 오신 것을 환영합니다! 순수 JavaScript, HTML, SCSS로 구축된 완성된 게시판 시스템의 데모입니다.

대시보드에는 태스크 관리를 위한 체크리스트, 최근 게시글 미리보기, 작업을 효과적으로 정리하는 데 도움이 되는 대화형 캘린더 등 다양한 기능이 포함되어 있습니다.

모든 기능을 자유롭게 탐색하고 모든 것이 어떻게 함께 작동하는지 확인해보세요!`
    },
    {
        id: 2,
        title: '프로젝트 설정 가이드',
        author: '사용자',
        date: '2026-03-07',
        views: 89,
        content: `이 가이드는 로컬 컴퓨터에서 프로젝트를 설정하는 데 도움이 됩니다.

1. 리포지토리 복제
2. 종속성 설치
3. 환경 구성
4. 개발 서버 실행

모든 것이 제대로 작동하도록 이 단계를 주의 깊게 따르세요.`
    },
    {
        id: 3,
        title: '대시보드 기능 개요',
        author: '관리자',
        date: '2026-03-06',
        views: 67,
        content: `대시보드는 활동에 대한 포괄적인 개요를 제공합니다.

기능에는 다음이 포함됩니다:
- 추가/삭제 기능이 있는 태스크 체크리스트
- 빠른 탐색 기능이 있는 최근 게시글 미리보기
- 날짜 관리를 위한 대화형 캘린더

모든 기능은 최대 성능을 위해 vanilla JavaScript로 구축되었습니다.`
    },
    {
        id: 4,
        title: 'JavaScript 베스트 프랙티스',
        author: '개발자',
        date: '2026-03-05',
        views: 54,
        content: `JavaScript 베스트 프랙티스와 코딩 표준에 대해 알아보세요.

주요 포인트:
- var 대신 const와 let 사용
- 깨끗하고 읽기 쉬운 코드 작성
- 명명 규칙 따르기
- 코드에 적절히 주석 달기`
    },
    {
        id: 5,
        title: '이벤트 루프 이해하기',
        author: '사용자',
        date: '2026-03-04',
        views: 42,
        content: `이벤트 루프는 JavaScript의 기본 개념입니다.

비동기 작업을 처리하고 코드 실행 순서를 보장합니다. 이를 이해하는 것은 효율적인 JavaScript 애플리케이션을 작성하는 데 중요합니다.`
    }
];

// Store posts in localStorage if not exists
if (!localStorage.getItem('posts')) {
    localStorage.setItem('posts', JSON.stringify(mockPosts));
}

// ==================== Board List Page ====================
if (document.getElementById('boardList')) {
    const boardList = document.getElementById('boardList');
    const writeBtn = document.getElementById('writeBtn');
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    // Navigate to write page
    writeBtn.addEventListener('click', () => {
        window.location.href = 'board-write.html';
    });

    // Render board list
    function renderBoardList(posts = null) {
        const allPosts = posts || JSON.parse(localStorage.getItem('posts')) || [];
        boardList.innerHTML = '';

        allPosts.forEach(post => {
            const row = document.createElement('div');
            row.className = 'table-row';
            row.dataset.id = post.id;
            row.innerHTML = `
                <div class="col-id">${post.id}</div>
                <div class="col-title">${post.title}</div>
                <div class="col-author">${post.author}</div>
                <div class="col-date">${post.date}</div>
                <div class="col-views">${post.views}</div>
            `;
            boardList.appendChild(row);
        });
    }

    // Navigate to view page
    boardList.addEventListener('click', (e) => {
        const row = e.target.closest('.table-row');
        if (row) {
            const postId = row.dataset.id;
            window.location.href = `board-view.html?id=${postId}`;
        }
    });

    // Search functionality
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        if (query) {
            const allPosts = JSON.parse(localStorage.getItem('posts')) || [];
            const filtered = allPosts.filter(post =>
                post.title.toLowerCase().includes(query) ||
                post.content.toLowerCase().includes(query) ||
                post.author.toLowerCase().includes(query)
            );
            renderBoardList(filtered);
        } else {
            renderBoardList();
        }
    }

    // Initial render
    renderBoardList();
}

// ==================== Write Page ====================
if (document.getElementById('writeForm')) {
    const writeForm = document.getElementById('writeForm');
    const cancelBtn = document.getElementById('cancelBtn');

    cancelBtn.addEventListener('click', () => {
        if (confirm('취소하시겠습니까? 저장하지 않은 변경 사항은 손실됩니다.')) {
            window.location.href = 'board-list.html';
        }
    });

    writeForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('postTitle').value.trim();
        const author = document.getElementById('postAuthor').value.trim();
        const content = document.getElementById('postContent').value.trim();

        if (title && author && content) {
            const posts = JSON.parse(localStorage.getItem('posts')) || [];
            const newPost = {
                id: posts.length + 1,
                title,
                author,
                date: new Date().toISOString().split('T')[0],
                views: 0,
                content
            };

            posts.unshift(newPost); // Add to beginning
            localStorage.setItem('posts', JSON.stringify(posts));

            alert('게시글이 성공적으로 등록되었습니다!');
            window.location.href = 'board-list.html';
        }
    });
}

// ==================== View Page ====================
if (document.getElementById('postTitle')) {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = parseInt(urlParams.get('id'));

    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    const post = posts.find(p => p.id === postId);

    if (post) {
        // Increment views
        post.views++;
        localStorage.setItem('posts', JSON.stringify(posts));

        // Display post
        document.getElementById('postTitle').textContent = post.title;
        document.getElementById('postAuthor').textContent = post.author;
        document.getElementById('postDate').textContent = post.date;
        document.getElementById('postViews').textContent = post.views;
        document.getElementById('postContent').innerHTML = post.content.split('\n').map(p => `<p>${p}</p>`).join('');
    } else {
        alert('게시글을 찾을 수 없습니다!');
        window.location.href = 'board-list.html';
    }

    // List button
    document.getElementById('listBtn').addEventListener('click', () => {
        window.location.href = 'board-list.html';
    });

    // Edit button
    document.getElementById('editBtn').addEventListener('click', () => {
        alert('수정 기능은 곧 추가될 예정입니다!');
    });

    // Delete button
    document.getElementById('deleteBtn').addEventListener('click', () => {
        if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
            const posts = JSON.parse(localStorage.getItem('posts')) || [];
            const filtered = posts.filter(p => p.id !== postId);
            localStorage.setItem('posts', JSON.stringify(filtered));
            alert('게시글이 삭제되었습니다!');
            window.location.href = 'board-list.html';
        }
    });

    // ===== Comments =====
    const commentsList = document.getElementById('commentsList');
    const commentInput = document.getElementById('commentInput');
    const submitCommentBtn = document.getElementById('submitComment');
    const commentCountElement = document.getElementById('commentCount');

    // Load comments from localStorage
    const commentsKey = `comments_${postId}`;
    let comments = JSON.parse(localStorage.getItem(commentsKey)) || [];

    function renderComments() {
        commentsList.innerHTML = '';
        commentCountElement.textContent = comments.length;

        comments.forEach((comment, index) => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment-item';
            commentElement.innerHTML = `
                <div class="comment-header">
                    <span class="comment-author">${comment.author}</span>
                    <span class="comment-date">${comment.date}</span>
                </div>
                <div class="comment-content">${comment.content}</div>
                <button class="btn-delete-comment" data-index="${index}">삭제</button>
            `;
            commentsList.appendChild(commentElement);
        });

        // Add delete event listeners
        document.querySelectorAll('.btn-delete-comment').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                deleteComment(index);
            });
        });
    }

    function addComment() {
        const content = commentInput.value.trim();
        if (content) {
            const newComment = {
                author: '익명',
                date: new Date().toISOString().split('T')[0],
                content
            };
            comments.push(newComment);
            localStorage.setItem(commentsKey, JSON.stringify(comments));
            commentInput.value = '';
            renderComments();
        }
    }

    function deleteComment(index) {
        if (confirm('이 댓글을 삭제하시겠습니까?')) {
            comments.splice(index, 1);
            localStorage.setItem(commentsKey, JSON.stringify(comments));
            renderComments();
        }
    }

    submitCommentBtn.addEventListener('click', addComment);
    commentInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addComment();
        }
    });

    // Initial render
    renderComments();
}