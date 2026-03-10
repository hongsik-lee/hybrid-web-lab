const STORAGE_KEY = 'vueFocusQuestData';
const TIMER_INTERVAL_MS = 1000;

let timerIntervalId = null;
let draggedTaskId = null;

const PRIORITY_LABEL = {
    high: '중요',
    medium: '보통',
    low: '가벼움'
};

const WEEK_DAY = ['일', '월', '화', '수', '목', '금', '토'];
const WEEK_CODE = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const TEMPLATE_PRESETS = {
    judo: {
        title: '루틴 A · 딥워크 스프린트',
        description: '고난도 집중 작업을 짧고 강하게 끝내는 루틴입니다.',
        tasks: [
            { title: '핵심 아웃라인 작성', minutes: 30, priority: 'high' },
            { title: '세부 슬라이드 보강', minutes: 25, priority: 'medium' },
            { title: '최종 리허설 1회', minutes: 20, priority: 'high' }
        ]
    },
    balance: {
        title: '루틴 B · 밸런스 메이커',
        description: '업무·정리·회복을 균형 있게 분배하는 루틴입니다.',
        tasks: [
            { title: '집중 작업 1개 완료', minutes: 25, priority: 'high' },
            { title: '메일/슬랙 정리', minutes: 15, priority: 'low' },
            { title: '다음 일정 계획 세팅', minutes: 20, priority: 'medium' }
        ]
    }
};

function todayKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function dateFromKey(dayKey) {
    const parts = String(dayKey || '').split('-').map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) {
        return new Date();
    }
    return new Date(parts[0], parts[1] - 1, parts[2]);
}

function formatDayLabel(dayKey) {
    const date = dateFromKey(dayKey);
    return `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEK_DAY[date.getDay()]})`;
}

function dayCodeFromKey(dayKey) {
    const date = dateFromKey(dayKey);
    return WEEK_CODE[date.getDay()];
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function createTask({ title, minutes, priority = 'medium', dayKey = todayKey(), status = 'todo', category = 'general' }) {
    return {
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: title.trim(),
        minutes: Number(minutes),
        priority,
        status,
        dayKey,
        category,
        order: Date.now(),
        archived: false,
        rewarded: false,
        createdAt: Date.now()
    };
}

function createDefaultData() {
    const today = todayKey();
    return {
        profile: {
            name: '플래너',
            dailySessionGoal: 3
        },
        settings: {
            focusMode: false,
            focusModeDefault: false
        },
        stats: {
            xp: 0,
            coins: 0,
            sessions: 0,
            streak: 0
        },
        challenge: {
            title: '오늘의 포커스 챌린지',
            description: '집중 세션 2회 + 완료 퀘스트 2개를 달성하세요.',
            targetSessions: 2,
            lastClaimKey: ''
        },
        timer: {
            durationSec: 25 * 60,
            remainingSec: 25 * 60,
            running: false,
            lastTickAt: null,
            currentTaskId: null
        },
        logs: {},
        tasks: [
            createTask({ title: '기획서 핵심 문단 작성', minutes: 35, priority: 'high', dayKey: today }),
            createTask({ title: '레퍼런스 화면 3개 분석', minutes: 20, priority: 'medium', dayKey: today }),
            createTask({ title: '회의 요약 및 공유', minutes: 15, priority: 'low', dayKey: today })
        ]
    };
}

function normalizeData(raw) {
    const base = createDefaultData();
    const parsed = raw && typeof raw === 'object' ? raw : {};
    const data = {
        ...base,
        ...parsed,
        profile: { ...base.profile, ...(parsed.profile || {}) },
        settings: { ...base.settings, ...(parsed.settings || {}) },
        stats: { ...base.stats, ...(parsed.stats || {}) },
        challenge: { ...base.challenge, ...(parsed.challenge || {}) },
        timer: { ...base.timer, ...(parsed.timer || {}) },
        logs: parsed.logs && typeof parsed.logs === 'object' ? parsed.logs : {},
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : base.tasks
    };

    data.tasks = data.tasks.map((task, index) => ({
        id: task.id || `legacy-${index}`,
        title: task.title || '제목 없는 퀘스트',
        minutes: Number(task.minutes) > 0 ? Number(task.minutes) : 25,
        priority: PRIORITY_LABEL[task.priority] ? task.priority : 'medium',
        status: ['todo', 'doing', 'done'].includes(task.status) ? task.status : (task.completed ? 'done' : 'todo'),
        dayKey: task.dayKey || todayKey(),
        category: task.category || 'general',
        order: Number.isFinite(task.order) ? task.order : Date.now() + index,
        archived: Boolean(task.archived),
        rewarded: Boolean(task.rewarded || task.completed),
        createdAt: Number.isFinite(task.createdAt) ? task.createdAt : Date.now()
    }));

    data.stats.streak = calculateStreak(data);
    return data;
}

function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        const initData = createDefaultData();
        saveData(initData);
        return initData;
    }

    try {
        const parsed = JSON.parse(raw);
        return normalizeData(parsed);
    } catch (error) {
        const fallback = createDefaultData();
        saveData(fallback);
        return fallback;
    }
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function ensureLog(data, dayKey) {
    if (!data.logs[dayKey]) {
        data.logs[dayKey] = {
            completed: 0,
            sessions: 0,
            focusMinutes: 0
        };
    }
    return data.logs[dayKey];
}

function levelFromXp(xp) {
    return Math.floor(Math.max(0, xp) / 120) + 1;
}

function levelProgress(xp) {
    const bounded = Math.max(0, xp % 120);
    return {
        current: bounded,
        next: 120,
        percent: Math.round((bounded / 120) * 100)
    };
}

function calculateStreak(data) {
    let streak = 0;
    for (let i = 0; i < 365; i += 1) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = todayKey(date);
        const log = data.logs[key];
        const active = Boolean(log && ((log.completed || 0) > 0 || (log.sessions || 0) > 0));
        if (!active) {
            break;
        }
        streak += 1;
    }
    return streak;
}

function getTaskById(data, taskId) {
    return data.tasks.find((task) => task.id === taskId);
}

function getActiveTasks(data) {
    return data.tasks.filter((task) => !task.archived);
}

function getTodayTasks(data) {
    const today = todayKey();
    return getActiveTasks(data)
        .filter((task) => task.dayKey === today)
        .sort((a, b) => a.order - b.order);
}

function formatSec(totalSec) {
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function showToast(message) {
    const toast = document.getElementById('statusToast');
    if (!toast) {
        return;
    }

    toast.textContent = message;
    toast.classList.add('show');
    window.setTimeout(() => {
        toast.classList.remove('show');
    }, 1700);
}

function spawnConfetti() {
    const layer = document.getElementById('confettiLayer');
    if (!layer) {
        return;
    }

    for (let i = 0; i < 18; i += 1) {
        const particle = document.createElement('span');
        particle.className = 'confetti';
        particle.style.left = `${10 + Math.random() * 80}%`;
        particle.style.setProperty('--dx', `${-70 + Math.random() * 140}px`);
        particle.style.setProperty('--dy', `${-40 - Math.random() * 120}px`);
        particle.style.setProperty('--rot', `${-160 + Math.random() * 320}deg`);
        particle.style.animationDelay = `${Math.random() * 0.1}s`;
        layer.appendChild(particle);
        window.setTimeout(() => particle.remove(), 800);
    }
}

function syncTimer(data) {
    if (!data.timer.running || !data.timer.lastTickAt) {
        return { data, completed: false };
    }

    const elapsedSec = Math.floor((Date.now() - data.timer.lastTickAt) / 1000);
    if (elapsedSec <= 0) {
        return { data, completed: false };
    }

    const next = {
        ...data,
        timer: {
            ...data.timer,
            remainingSec: Math.max(0, data.timer.remainingSec - elapsedSec),
            lastTickAt: Date.now()
        }
    };

    let completed = false;
    if (next.timer.remainingSec === 0) {
        next.timer.running = false;
        next.timer.lastTickAt = null;
        completed = true;
    }

    return { data: next, completed };
}

function registerTimerCompletion(data) {
    const day = todayKey();
    const log = ensureLog(data, day);

    log.sessions += 1;
    log.focusMinutes += Math.max(1, Math.round(data.timer.durationSec / 60));

    data.stats.sessions += 1;
    data.stats.xp += 18;
    data.stats.coins += 3;
    data.stats.streak = calculateStreak(data);

    data.timer.currentTaskId = null;
    data.timer.remainingSec = data.timer.durationSec;

    return data;
}

function refreshTimerState({ reward = true } = {}) {
    let data = loadData();
    const synced = syncTimer(data);
    data = synced.data;

    if (synced.completed && reward) {
        data = registerTimerCompletion(data);
        showToast('집중 세션 완료! 보상이 지급되었습니다.');
        spawnConfetti();
    }

    saveData(data);

    if (!data.timer.running) {
        stopTimerLoop();
    }

    return { data, completed: synced.completed };
}

function startTimerLoop() {
    if (timerIntervalId) {
        window.clearInterval(timerIntervalId);
    }

    timerIntervalId = window.setInterval(() => {
        const { data, completed } = refreshTimerState({ reward: true });
        renderTimerWidgets(data);
        if (completed) {
            renderByPage(data);
        }
    }, TIMER_INTERVAL_MS);
}

function stopTimerLoop() {
    if (timerIntervalId) {
        window.clearInterval(timerIntervalId);
        timerIntervalId = null;
    }
}

function applyFocusMode(data) {
    document.body.classList.toggle('is-focus', Boolean(data.settings.focusMode));
}

function setBottomNavActive() {
    const links = document.querySelectorAll('.bottom-nav a');
    if (!links.length) {
        return;
    }

    const current = window.location.pathname.split('/').pop();
    links.forEach((link) => {
        const href = link.getAttribute('href') || '';
        link.classList.toggle('active', href.includes(current));
    });
}

function renderTimerWidgets(data) {
    const timerText = document.getElementById('timerText');
    const timerHint = document.getElementById('timerHint');
    const timerProgress = document.getElementById('timerProgress');
    const timerTaskSelect = document.getElementById('timerTaskSelect');
    const focusToggleBtn = document.getElementById('focusToggleBtn');

    if (timerText) {
        timerText.textContent = formatSec(data.timer.remainingSec);
    }

    if (timerHint) {
        if (data.timer.running) {
            timerHint.textContent = '집중 진행 중';
        } else if (data.timer.remainingSec === data.timer.durationSec) {
            timerHint.textContent = '대기 중';
        } else {
            timerHint.textContent = '일시정지';
        }
    }

    if (timerProgress) {
        const percent = data.timer.durationSec
            ? Math.max(0, Math.min(100, Math.round((data.timer.remainingSec / data.timer.durationSec) * 100)))
            : 0;
        timerProgress.style.width = `${percent}%`;
    }

    if (timerTaskSelect) {
        const currentValue = timerTaskSelect.value;
        const options = getTodayTasks(data).filter((task) => task.status !== 'done');
        timerTaskSelect.innerHTML = options.length
            ? options.map((task) => `<option value="${task.id}">${escapeHtml(task.title)}</option>`).join('')
            : '<option value="">오늘 퀘스트 없음</option>';

        if (options.some((task) => task.id === currentValue)) {
            timerTaskSelect.value = currentValue;
        }
    }

    if (focusToggleBtn) {
        focusToggleBtn.textContent = data.settings.focusMode ? '포커스 모드 ON' : '포커스 모드 OFF';
    }
}

function rewardCompletedTask(data, task) {
    const log = ensureLog(data, task.dayKey || todayKey());
    log.completed += 1;

    task.rewarded = true;
    data.stats.xp += 30;
    data.stats.coins += 5;
    data.stats.streak = calculateStreak(data);
}

function setTaskStatus(taskId, nextStatus) {
    const data = loadData();
    const task = getTaskById(data, taskId);
    if (!task) {
        return;
    }

    task.status = nextStatus;

    if (nextStatus === 'done' && !task.rewarded) {
        rewardCompletedTask(data, task);
        spawnConfetti();
        showToast('퀘스트 완료! XP와 코인을 획득했습니다.');
    }

    saveData(data);
    renderByPage(data);
}

function archiveTask(taskId) {
    const data = loadData();
    const task = getTaskById(data, taskId);
    if (!task) {
        return;
    }

    task.archived = true;
    if (task.status === 'doing') {
        task.status = 'todo';
    }

    saveData(data);
    showToast('퀘스트를 보관함으로 이동했습니다.');
    renderByPage(data);
}

function restoreTask(taskId) {
    const data = loadData();
    const task = getTaskById(data, taskId);
    if (!task) {
        return;
    }

    task.archived = false;
    task.dayKey = todayKey();
    task.status = 'todo';
    task.order = Date.now();

    saveData(data);
    showToast('퀘스트를 오늘 목록으로 복원했습니다.');
    renderByPage(data);
}

function deleteTask(taskId) {
    const data = loadData();
    data.tasks = data.tasks.filter((task) => task.id !== taskId);
    saveData(data);
    showToast('퀘스트를 삭제했습니다.');
    renderByPage(data);
}

function startTaskFocus(taskId) {
    const data = loadData();
    const task = getTaskById(data, taskId);
    if (!task) {
        return;
    }

    data.timer.currentTaskId = task.id;
    if (task.status === 'todo') {
        task.status = 'doing';
    }
    if (!data.timer.durationSec) {
        data.timer.durationSec = 25 * 60;
        data.timer.remainingSec = 25 * 60;
    }
    data.timer.running = true;
    data.timer.lastTickAt = Date.now();

    saveData(data);
    startTimerLoop();
    renderByPage(data);
}

function reorderTodayTasks(dragId, targetId) {
    const data = loadData();
    const today = todayKey();
    const tasks = getTodayTasks(data).filter((task) => !task.archived);
    const ids = tasks.map((task) => task.id);

    const dragIndex = ids.indexOf(dragId);
    const targetIndex = ids.indexOf(targetId);
    if (dragIndex < 0 || targetIndex < 0 || dragIndex === targetIndex) {
        return;
    }

    ids.splice(dragIndex, 1);
    ids.splice(targetIndex, 0, dragId);

    ids.forEach((taskId, index) => {
        const task = getTaskById(data, taskId);
        if (task) {
            task.order = Date.now() + index;
            task.dayKey = today;
        }
    });

    saveData(data);
    renderByPage(data);
}

function moveTaskToStatus(taskId, status) {
    const data = loadData();
    const task = getTaskById(data, taskId);
    if (!task) {
        return;
    }

    task.archived = false;
    task.dayKey = todayKey();
    task.status = status;
    task.order = Date.now();

    if (status === 'done' && !task.rewarded) {
        rewardCompletedTask(data, task);
        spawnConfetti();
        showToast('보드 완료 처리! 보상이 지급되었습니다.');
    }

    saveData(data);
    renderByPage(data);
}

function buildTaskCard(task, { compact = false, enableSwipe = false } = {}) {
    const li = document.createElement('li');
    li.className = `task-card priority-${task.priority} ${task.status === 'done' ? 'is-done' : ''} ${compact ? 'compact' : ''}`;
    li.dataset.taskId = task.id;
    li.setAttribute('draggable', 'true');

    li.innerHTML = `
        <div class="task-main">
            <p class="task-title">${escapeHtml(task.title)}</p>
            <p class="task-meta">${task.minutes}분 · ${PRIORITY_LABEL[task.priority]} · ${formatDayLabel(task.dayKey)}</p>
        </div>
        <div class="task-actions">
            <button type="button" class="btn-soft" data-action="focus" data-id="${task.id}">집중</button>
            <button type="button" class="btn-soft" data-action="toggle-done" data-id="${task.id}">${task.status === 'done' ? '되돌리기' : '완료'}</button>
            <button type="button" class="btn-soft" data-action="archive" data-id="${task.id}">보관</button>
        </div>
    `;

    if (enableSwipe) {
        bindSwipeGesture(li, task.id);
    }

    li.addEventListener('dragstart', () => {
        draggedTaskId = task.id;
        li.classList.add('is-dragging');
    });

    li.addEventListener('dragend', () => {
        draggedTaskId = null;
        li.classList.remove('is-dragging');
    });

    return li;
}

function bindSwipeGesture(element, taskId) {
    let startX = 0;
    let currentX = 0;
    let dragging = false;

    element.addEventListener('pointerdown', (event) => {
        dragging = true;
        startX = event.clientX;
        currentX = event.clientX;
        element.setPointerCapture(event.pointerId);
    });

    element.addEventListener('pointermove', (event) => {
        if (!dragging) {
            return;
        }
        currentX = event.clientX;
        const delta = currentX - startX;
        if (Math.abs(delta) < 6) {
            return;
        }
        element.style.transform = `translateX(${delta * 0.6}px)`;
    });

    const finish = () => {
        if (!dragging) {
            return;
        }

        dragging = false;
        const delta = currentX - startX;
        element.style.transform = '';

        if (delta > 90) {
            setTaskStatus(taskId, 'done');
        } else if (delta < -90) {
            archiveTask(taskId);
        }
    };

    element.addEventListener('pointerup', finish);
    element.addEventListener('pointercancel', finish);
}

function renderHomeHero(data) {
    const heroName = document.getElementById('heroName');
    const heroLevel = document.getElementById('heroLevel');
    const heroXp = document.getElementById('heroXp');
    const heroCoins = document.getElementById('heroCoins');
    const heroStreak = document.getElementById('heroStreak');
    const challengeSummary = document.getElementById('todayChallengeSummary');

    const progress = levelProgress(data.stats.xp);
    const today = todayKey();
    const todayLog = ensureLog(data, today);
    const doneToday = getTodayTasks(data).filter((task) => task.status === 'done').length;

    if (heroName) {
        heroName.textContent = `${data.profile.name}님의 Focus Quest`;
    }
    if (heroLevel) {
        heroLevel.textContent = `Lv.${levelFromXp(data.stats.xp)}`;
    }
    if (heroXp) {
        heroXp.textContent = `XP ${progress.current}/${progress.next}`;
    }
    if (heroCoins) {
        heroCoins.textContent = `코인 ${data.stats.coins}`;
    }
    if (heroStreak) {
        heroStreak.textContent = `연속 ${data.stats.streak}일`;
    }
    if (challengeSummary) {
        challengeSummary.textContent = `오늘 세션 ${todayLog.sessions}회 · 완료 ${doneToday}개`;
    }

    const heroCard = document.getElementById('heroCard');
    if (heroCard && heroCard.dataset.bound !== 'true') {
        heroCard.dataset.bound = 'true';
        heroCard.addEventListener('mousemove', (event) => {
            const rect = heroCard.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const moveX = (event.clientX - centerX) / rect.width;
            const moveY = (event.clientY - centerY) / rect.height;

            heroCard.style.setProperty('--tiltX', `${(moveY * -8).toFixed(2)}deg`);
            heroCard.style.setProperty('--tiltY', `${(moveX * 8).toFixed(2)}deg`);
        });

        heroCard.addEventListener('mouseleave', () => {
            heroCard.style.setProperty('--tiltX', '0deg');
            heroCard.style.setProperty('--tiltY', '0deg');
        });
    }
}

function renderHomeTasks(data) {
    const list = document.getElementById('todayTaskList');
    if (!list) {
        return;
    }

    const tasks = getTodayTasks(data);
    list.innerHTML = '';

    if (!tasks.length) {
        list.innerHTML = '<li class="empty">오늘 등록된 퀘스트가 없습니다.</li>';
        return;
    }

    tasks.forEach((task) => {
        const card = buildTaskCard(task, { enableSwipe: true });

        card.addEventListener('dragover', (event) => {
            event.preventDefault();
            card.classList.add('drag-over');
        });

        card.addEventListener('dragleave', () => {
            card.classList.remove('drag-over');
        });

        card.addEventListener('drop', (event) => {
            event.preventDefault();
            card.classList.remove('drag-over');
            if (draggedTaskId) {
                reorderTodayTasks(draggedTaskId, task.id);
            }
        });

        list.appendChild(card);
    });
}

function bindHomeEvents() {
    const form = document.getElementById('taskCreateForm');
    if (form && form.dataset.bound !== 'true') {
        form.dataset.bound = 'true';

        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const titleInput = document.getElementById('taskTitleInput');
            const minutesInput = document.getElementById('taskMinutesInput');
            const priorityInput = document.getElementById('taskPriorityInput');

            const title = titleInput.value.trim();
            const minutes = Number(minutesInput.value);
            const priority = priorityInput.value;

            if (!title || !Number.isFinite(minutes) || minutes < 10) {
                return;
            }

            const data = loadData();
            data.tasks.unshift(createTask({ title, minutes, priority, dayKey: todayKey() }));
            saveData(data);

            form.reset();
            minutesInput.value = '30';
            priorityInput.value = 'medium';

            showToast('새 퀘스트를 추가했습니다.');
            renderByPage(data);
        });
    }

    const timerStartBtn = document.getElementById('timerStartBtn');
    const timerPauseBtn = document.getElementById('timerPauseBtn');
    const timerResetBtn = document.getElementById('timerResetBtn');
    const focusToggleBtn = document.getElementById('focusToggleBtn');

    if (timerStartBtn && timerStartBtn.dataset.bound !== 'true') {
        timerStartBtn.dataset.bound = 'true';
        timerStartBtn.addEventListener('click', () => {
            const data = loadData();
            const select = document.getElementById('timerTaskSelect');

            if (select && select.value) {
                data.timer.currentTaskId = select.value;
                const selectedTask = getTaskById(data, select.value);
                if (selectedTask && selectedTask.status === 'todo') {
                    selectedTask.status = 'doing';
                }
            }

            if (!data.timer.durationSec) {
                data.timer.durationSec = 25 * 60;
                data.timer.remainingSec = 25 * 60;
            }

            data.timer.running = true;
            data.timer.lastTickAt = Date.now();
            saveData(data);

            startTimerLoop();
            renderByPage(data);
        });
    }

    if (timerPauseBtn && timerPauseBtn.dataset.bound !== 'true') {
        timerPauseBtn.dataset.bound = 'true';
        timerPauseBtn.addEventListener('click', () => {
            const synced = refreshTimerState({ reward: false }).data;
            synced.timer.running = false;
            synced.timer.lastTickAt = null;
            saveData(synced);
            stopTimerLoop();
            renderByPage(synced);
        });
    }

    if (timerResetBtn && timerResetBtn.dataset.bound !== 'true') {
        timerResetBtn.dataset.bound = 'true';
        timerResetBtn.addEventListener('click', () => {
            const data = loadData();
            data.timer.running = false;
            data.timer.lastTickAt = null;
            data.timer.remainingSec = data.timer.durationSec;
            data.timer.currentTaskId = null;
            saveData(data);
            stopTimerLoop();
            renderByPage(data);
        });
    }

    document.querySelectorAll('.preset-btn').forEach((button) => {
        if (button.dataset.bound === 'true') {
            return;
        }

        button.dataset.bound = 'true';
        button.addEventListener('click', () => {
            const minutes = Number(button.getAttribute('data-minutes') || '25');
            const data = loadData();
            data.timer.durationSec = minutes * 60;
            data.timer.remainingSec = minutes * 60;
            data.timer.running = false;
            data.timer.lastTickAt = null;
            saveData(data);
            stopTimerLoop();
            renderByPage(data);
            showToast(`${minutes}분 프리셋으로 변경했습니다.`);
        });
    });

    if (focusToggleBtn && focusToggleBtn.dataset.bound !== 'true') {
        focusToggleBtn.dataset.bound = 'true';
        focusToggleBtn.addEventListener('click', () => {
            const data = loadData();
            data.settings.focusMode = !data.settings.focusMode;
            saveData(data);
            renderByPage(data);
        });
    }
}

function renderHomePage(data) {
    renderHomeHero(data);
    renderTimerWidgets(data);
    renderHomeTasks(data);
    bindHomeEvents();
}

function renderBoardList(listEl, tasks) {
    if (!listEl) {
        return;
    }

    listEl.innerHTML = '';
    if (!tasks.length) {
        listEl.innerHTML = '<li class="empty">없음</li>';
        return;
    }

    tasks.forEach((task) => {
        const card = buildTaskCard(task, { compact: true });
        listEl.appendChild(card);
    });
}

function renderArchiveList(data) {
    const list = document.getElementById('archiveList');
    if (!list) {
        return;
    }

    const archived = data.tasks.filter((task) => task.archived).sort((a, b) => b.createdAt - a.createdAt);
    list.innerHTML = '';

    if (!archived.length) {
        list.innerHTML = '<li class="empty">보관된 퀘스트가 없습니다.</li>';
        return;
    }

    archived.forEach((task) => {
        const li = document.createElement('li');
        li.className = 'task-card compact';
        li.innerHTML = `
            <div class="task-main">
                <p class="task-title">${escapeHtml(task.title)}</p>
                <p class="task-meta">${task.minutes}분 · ${PRIORITY_LABEL[task.priority]}</p>
            </div>
            <div class="task-actions">
                <button type="button" class="btn-soft" data-action="restore" data-id="${task.id}">복원</button>
                <button type="button" class="btn-soft" data-action="delete" data-id="${task.id}">삭제</button>
            </div>
        `;
        list.appendChild(li);
    });
}

function bindPlansEvents() {
    const form = document.getElementById('planQuickAddForm');
    if (form && form.dataset.bound !== 'true') {
        form.dataset.bound = 'true';
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const title = document.getElementById('planTitleInput').value.trim();
            const minutes = Number(document.getElementById('planMinutesInput').value);
            const priority = document.getElementById('planPriorityInput').value;

            if (!title || !Number.isFinite(minutes) || minutes < 10) {
                return;
            }

            const data = loadData();
            data.tasks.unshift(createTask({ title, minutes, priority, dayKey: todayKey() }));
            saveData(data);
            form.reset();
            document.getElementById('planMinutesInput').value = '25';
            document.getElementById('planPriorityInput').value = 'medium';
            renderByPage(data);
            showToast('보드에 새 퀘스트를 추가했습니다.');
        });
    }

    document.querySelectorAll('.board-list').forEach((zone) => {
        if (zone.dataset.bound === 'true') {
            return;
        }

        zone.dataset.bound = 'true';

        zone.addEventListener('dragover', (event) => {
            event.preventDefault();
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });

        zone.addEventListener('drop', (event) => {
            event.preventDefault();
            zone.classList.remove('drag-over');
            const status = zone.getAttribute('data-status');
            if (draggedTaskId && status) {
                moveTaskToStatus(draggedTaskId, status);
            }
        });
    });
}

function renderPlansPage(data) {
    const active = getActiveTasks(data).sort((a, b) => a.order - b.order);
    renderBoardList(document.getElementById('boardTodo'), active.filter((task) => task.status === 'todo'));
    renderBoardList(document.getElementById('boardDoing'), active.filter((task) => task.status === 'doing'));
    renderBoardList(document.getElementById('boardDone'), active.filter((task) => task.status === 'done'));
    renderArchiveList(data);
    bindPlansEvents();
}

function buildHeatmap(data, days) {
    const grid = document.getElementById('heatmapGrid');
    const detail = document.getElementById('heatmapDetail');
    if (!grid) {
        return;
    }

    grid.innerHTML = '';

    const dates = [];
    for (let i = days - 1; i >= 0; i -= 1) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date);
    }

    dates.forEach((date) => {
        const key = todayKey(date);
        const log = data.logs[key] || { completed: 0, sessions: 0, focusMinutes: 0 };
        const score = Math.min(4, log.completed + log.sessions);

        const button = document.createElement('button');
        button.type = 'button';
        button.className = `heat-cell level-${score}`;
        button.setAttribute('aria-label', `${formatDayLabel(key)} 활동`);

        button.addEventListener('click', () => {
            if (detail) {
                detail.textContent = `${formatDayLabel(key)} · 완료 ${log.completed}개 · 세션 ${log.sessions}회 · 집중 ${log.focusMinutes}분`;
            }
        });

        grid.appendChild(button);
    });
}

function renderInsights(data, days) {
    const insightList = document.getElementById('insightList');
    if (!insightList) {
        return;
    }

    const active = getActiveTasks(data);
    const done = active.filter((task) => task.status === 'done').length;
    const todo = active.filter((task) => task.status !== 'done').length;

    let completedInRange = 0;
    let sessionsInRange = 0;
    for (let i = 0; i < days; i += 1) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = todayKey(date);
        const log = data.logs[key];
        if (log) {
            completedInRange += log.completed || 0;
            sessionsInRange += log.sessions || 0;
        }
    }

    const completionRate = active.length ? Math.round((done / active.length) * 100) : 0;
    const highPriorityPending = active.filter((task) => task.priority === 'high' && task.status !== 'done').length;

    insightList.innerHTML = `
        <li>전체 완료율 ${completionRate}% (${done}/${active.length || 0})</li>
        <li>최근 ${days}일 집중 세션 ${sessionsInRange}회</li>
        <li>최근 ${days}일 완료 퀘스트 ${completedInRange}개</li>
        <li>미완료 중요 퀘스트 ${highPriorityPending}개</li>
        <li>현재 대기 퀘스트 ${todo}개</li>
    `;
}

function bindStatsEvents() {
    document.querySelectorAll('.range-btn').forEach((button) => {
        if (button.dataset.bound === 'true') {
            return;
        }

        button.dataset.bound = 'true';
        button.addEventListener('click', () => {
            document.querySelectorAll('.range-btn').forEach((item) => item.classList.remove('active'));
            button.classList.add('active');
            renderStatsPage(loadData());
        });
    });
}

function renderStatsPage(data) {
    const levelEl = document.getElementById('statsLevelValue');
    const xpEl = document.getElementById('statsXpValue');
    const coinEl = document.getElementById('statsCoinValue');
    const sessionEl = document.getElementById('statsSessionValue');
    const streakEl = document.getElementById('statsStreakValue');

    if (levelEl) {
        levelEl.textContent = String(levelFromXp(data.stats.xp));
    }
    if (xpEl) {
        xpEl.textContent = String(data.stats.xp);
    }
    if (coinEl) {
        coinEl.textContent = String(data.stats.coins);
    }
    if (sessionEl) {
        sessionEl.textContent = String(data.stats.sessions);
    }
    if (streakEl) {
        streakEl.textContent = `${data.stats.streak}일`;
    }

    const activeRange = document.querySelector('.range-btn.active');
    const days = activeRange && activeRange.getAttribute('data-range') === 'month' ? 28 : 7;
    buildHeatmap(data, days);
    renderInsights(data, days);
    bindStatsEvents();
}

function bindProfileEvents() {
    const form = document.getElementById('profileForm');
    if (form && form.dataset.bound !== 'true') {
        form.dataset.bound = 'true';
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const name = document.getElementById('profileNameInput').value.trim();
            const goal = Number(document.getElementById('profileGoalInput').value);
            const focusDefault = document.getElementById('profileFocusDefault').checked;

            if (!name || !Number.isFinite(goal) || goal < 1) {
                return;
            }

            const data = loadData();
            data.profile.name = name;
            data.profile.dailySessionGoal = goal;
            data.settings.focusModeDefault = focusDefault;
            if (focusDefault) {
                data.settings.focusMode = true;
            }
            saveData(data);
            showToast('프로필 설정을 저장했습니다.');
            renderByPage(data);
        });
    }

    const resetBtn = document.getElementById('resetDataBtn');
    if (resetBtn && resetBtn.dataset.bound !== 'true') {
        resetBtn.dataset.bound = 'true';
        resetBtn.addEventListener('click', () => {
            const ok = window.confirm('정말로 데이터를 초기화할까요?');
            if (!ok) {
                return;
            }

            const fresh = createDefaultData();
            saveData(fresh);
            showToast('데이터를 초기화했습니다.');
            renderByPage(fresh);
        });
    }
}

function renderProfilePage(data) {
    const summary = document.getElementById('profileSummary');
    if (summary) {
        summary.textContent = `${data.profile.name} · 목표 ${data.profile.dailySessionGoal}세션 · 포커스 기본 ${data.settings.focusModeDefault ? 'ON' : 'OFF'}`;
    }

    const nameInput = document.getElementById('profileNameInput');
    const goalInput = document.getElementById('profileGoalInput');
    const focusDefault = document.getElementById('profileFocusDefault');

    if (nameInput) {
        nameInput.value = data.profile.name;
    }
    if (goalInput) {
        goalInput.value = String(data.profile.dailySessionGoal);
    }
    if (focusDefault) {
        focusDefault.checked = Boolean(data.settings.focusModeDefault);
    }

    bindProfileEvents();
}

function renderSearchResults(data, query) {
    const resultList = document.getElementById('searchResultList');
    if (!resultList) {
        return;
    }

    const normalized = query.trim().toLowerCase();
    const source = getActiveTasks(data).sort((a, b) => b.createdAt - a.createdAt);

    const matched = normalized
        ? source.filter((task) => task.title.toLowerCase().includes(normalized) || task.status.toLowerCase().includes(normalized))
        : source.slice(0, 8);

    resultList.innerHTML = '';
    if (!matched.length) {
        resultList.innerHTML = '<li class="empty">검색 결과가 없습니다.</li>';
        return;
    }

    matched.forEach((task) => {
        const li = document.createElement('li');
        li.className = 'task-card compact';
        li.innerHTML = `
            <div class="task-main">
                <p class="task-title">${escapeHtml(task.title)}</p>
                <p class="task-meta">${task.minutes}분 · ${PRIORITY_LABEL[task.priority]} · ${task.status}</p>
            </div>
            <div class="task-actions">
                <a class="ghost-link" href="./day.html?day=${task.dayKey}">이동</a>
            </div>
        `;
        resultList.appendChild(li);
    });
}

function bindSearchEvents() {
    const form = document.getElementById('searchForm');
    const input = document.getElementById('searchInput');

    if (form && form.dataset.bound !== 'true') {
        form.dataset.bound = 'true';
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            renderSearchResults(loadData(), input ? input.value : '');
        });
    }

    document.querySelectorAll('[data-keyword]').forEach((button) => {
        if (button.dataset.bound === 'true') {
            return;
        }

        button.dataset.bound = 'true';
        button.addEventListener('click', () => {
            const keyword = button.getAttribute('data-keyword') || '';
            if (input) {
                input.value = keyword;
            }
            renderSearchResults(loadData(), keyword);
        });
    });
}

function renderSearchPage(data) {
    const input = document.getElementById('searchInput');
    renderSearchResults(data, input ? input.value : '');
    bindSearchEvents();
}

function challengeState(data) {
    const today = todayKey();
    const todayLog = ensureLog(data, today);
    const todayTasks = getTodayTasks(data);
    const completedToday = todayTasks.filter((task) => task.status === 'done').length;

    const checks = [
        {
            text: `오늘 퀘스트 3개 이상 등록 (${todayTasks.length}/3)`,
            done: todayTasks.length >= 3
        },
        {
            text: `집중 세션 ${data.challenge.targetSessions}회 달성 (${todayLog.sessions}/${data.challenge.targetSessions})`,
            done: todayLog.sessions >= data.challenge.targetSessions
        },
        {
            text: `완료 퀘스트 2개 달성 (${completedToday}/2)`,
            done: completedToday >= 2
        }
    ];

    const doneCount = checks.filter((check) => check.done).length;
    return {
        checks,
        doneCount,
        progress: Math.round((doneCount / checks.length) * 100)
    };
}

function bindChallengeEvents() {
    const claimBtn = document.getElementById('claimRewardBtn');
    if (!claimBtn || claimBtn.dataset.bound === 'true') {
        return;
    }

    claimBtn.dataset.bound = 'true';
    claimBtn.addEventListener('click', () => {
        const data = loadData();
        const state = challengeState(data);
        const today = todayKey();

        if (state.doneCount !== state.checks.length) {
            showToast('아직 모든 조건을 달성하지 못했습니다.');
            return;
        }

        if (data.challenge.lastClaimKey === today) {
            showToast('오늘 보상은 이미 수령했습니다.');
            return;
        }

        data.challenge.lastClaimKey = today;
        data.stats.xp += 80;
        data.stats.coins += 20;
        data.stats.streak = calculateStreak(data);
        saveData(data);

        spawnConfetti();
        showToast('챌린지 클리어! 보상 수령 완료');
        renderByPage(data);
    });
}

function renderChallengePage(data) {
    const title = document.getElementById('challengeTitle');
    const desc = document.getElementById('challengeDesc');
    const progressText = document.getElementById('challengeProgressText');
    const progressFill = document.getElementById('challengeProgressFill');
    const checklist = document.getElementById('challengeChecklist');
    const claimBtn = document.getElementById('claimRewardBtn');

    const state = challengeState(data);
    const today = todayKey();

    if (title) {
        title.textContent = data.challenge.title;
    }
    if (desc) {
        desc.textContent = data.challenge.description;
    }
    if (progressText) {
        progressText.textContent = `${state.progress}%`;
    }
    if (progressFill) {
        progressFill.style.width = `${state.progress}%`;
    }
    if (checklist) {
        checklist.innerHTML = state.checks
            .map((check) => `<li class="${check.done ? 'done' : ''}">${check.done ? '✅' : '⬜'} ${escapeHtml(check.text)}</li>`)
            .join('');
    }
    if (claimBtn) {
        const canClaim = state.doneCount === state.checks.length && data.challenge.lastClaimKey !== today;
        claimBtn.disabled = !canClaim;
        claimBtn.textContent = canClaim ? '보상 받기' : '조건 달성 후 수령 가능';
    }

    bindChallengeEvents();
}

function renderDayPage(data) {
    const header = document.getElementById('dayHeaderText');
    const list = document.getElementById('dayTaskList');
    if (!list) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const dayParam = (params.get('day') || '').toLowerCase();

    let targetKey = dayParam;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetKey)) {
        targetKey = todayKey();
    }

    const targetTasks = getActiveTasks(data)
        .filter((task) => task.dayKey === targetKey || dayCodeFromKey(task.dayKey) === dayParam)
        .sort((a, b) => a.order - b.order);

    if (header) {
        header.textContent = `${formatDayLabel(targetKey)} · ${targetTasks.length}개 퀘스트`;
    }

    list.innerHTML = '';
    if (!targetTasks.length) {
        list.innerHTML = '<li class="empty">해당 날짜의 퀘스트가 없습니다.</li>';
        return;
    }

    targetTasks.forEach((task) => {
        list.appendChild(buildTaskCard(task));
    });
}

function renderActionPage() {
    const message = document.getElementById('actionMessage');
    if (!message) {
        return;
    }

    const type = new URLSearchParams(window.location.search).get('type') || 'default';
    const map = {
        timer: '집중 타이머를 바로 시작할 준비가 되었습니다.',
        share: '오늘 달성률 스냅샷을 공유할 수 있습니다.',
        prep: '집중 전에 필요한 체크리스트를 점검하세요.',
        join: '루틴 실행 흐름으로 이동할 수 있습니다.'
    };

    message.textContent = map[type] || '선택한 액션을 실행할 수 있습니다.';
}

function renderTemplatePage(data) {
    const templateKey = document.body.getAttribute('data-template') || 'judo';
    const template = TEMPLATE_PRESETS[templateKey] || TEMPLATE_PRESETS.judo;

    const title = document.getElementById('templateTitle');
    const desc = document.getElementById('templateDesc');
    const list = document.getElementById('templateList');
    const applyBtn = document.getElementById('applyTemplateBtn');

    if (title) {
        title.textContent = template.title;
    }
    if (desc) {
        desc.textContent = template.description;
    }
    if (list) {
        list.innerHTML = template.tasks
            .map((task) => `<li>• ${escapeHtml(task.title)} (${task.minutes}분 / ${PRIORITY_LABEL[task.priority]})</li>`)
            .join('');
    }

    if (applyBtn && applyBtn.dataset.bound !== 'true') {
        applyBtn.dataset.bound = 'true';
        applyBtn.addEventListener('click', () => {
            const fresh = loadData();
            template.tasks.forEach((task) => {
                fresh.tasks.unshift(createTask({
                    title: task.title,
                    minutes: task.minutes,
                    priority: task.priority,
                    dayKey: todayKey(),
                    category: templateKey
                }));
            });
            saveData(fresh);
            showToast('루틴을 오늘 퀘스트에 추가했습니다.');
            window.setTimeout(() => {
                window.location.href = '../index.html';
            }, 300);
        });
    }

    renderTimerWidgets(data);
}

function bindGlobalTaskActions() {
    if (document.body.dataset.actionBound === 'true') {
        return;
    }
    document.body.dataset.actionBound = 'true';

    document.addEventListener('click', (event) => {
        const target = event.target.closest('[data-action][data-id]');
        if (!target) {
            return;
        }

        const action = target.getAttribute('data-action');
        const taskId = target.getAttribute('data-id');

        if (!taskId) {
            return;
        }

        if (action === 'toggle-done') {
            const data = loadData();
            const task = getTaskById(data, taskId);
            if (!task) {
                return;
            }
            setTaskStatus(taskId, task.status === 'done' ? 'todo' : 'done');
            return;
        }

        if (action === 'archive') {
            archiveTask(taskId);
            return;
        }

        if (action === 'delete') {
            deleteTask(taskId);
            return;
        }

        if (action === 'focus') {
            startTaskFocus(taskId);
            return;
        }

        if (action === 'restore') {
            restoreTask(taskId);
        }
    });
}

function renderByPage(data) {
    applyFocusMode(data);
    setBottomNavActive();

    const page = document.body.getAttribute('data-page');
    if (page === 'home') {
        renderHomePage(data);
        return;
    }
    if (page === 'plans') {
        renderPlansPage(data);
        return;
    }
    if (page === 'stats') {
        renderStatsPage(data);
        return;
    }
    if (page === 'profile') {
        renderProfilePage(data);
        return;
    }
    if (page === 'search') {
        renderSearchPage(data);
        return;
    }
    if (page === 'challenge') {
        renderChallengePage(data);
        return;
    }
    if (page === 'day') {
        renderDayPage(data);
        return;
    }
    if (page === 'action') {
        renderActionPage();
        return;
    }
    if (page === 'template') {
        renderTemplatePage(data);
    }
}

function init() {
    bindGlobalTaskActions();

    const synced = refreshTimerState({ reward: true });
    const data = synced.data;

    if (data.settings.focusModeDefault) {
        data.settings.focusMode = true;
        saveData(data);
    }

    renderByPage(data);
    renderTimerWidgets(data);

    if (data.timer.running) {
        startTimerLoop();
    }
}

init();