const STORAGE_KEY = 'viewPlannerData';
let timerIntervalId = null;
let homeDayInitialized = false;

function getTodayDayCode() {
    const map = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return map[new Date().getDay()];
}

const defaultData = {
    user: {
        name: '',
        role: '퍼스널 트레이닝 코치',
        onboarded: false
    },
    challenge: {
        title: '오늘의 챌린지',
        description: '오전 10시 전까지 계획을 완료하세요',
        completedCount: 0
    },
    selectedDay: getTodayDayCode(),
    timer: {
        durationSec: 0,
        remainingSec: 0,
        running: false,
        lastTickAt: null
    },
    plans: [
        {
            id: 'plan-judo',
            title: '주짓수 그룹 수업',
            day: 'wed',
            date: '5월 11일',
            time: '15:00 - 16:00',
            location: 'A6 강의실',
            priority: '중요',
            trainer: '트레이너 에블린 존',
            detailPath: './pages/plan-judo.html',
            completed: false
        },
        {
            id: 'plan-balance',
            title: '밸런스 훈련',
            day: 'fri',
            date: '5월 13일',
            time: '11:00 - 14:00',
            location: 'A2 룸',
            priority: '보통',
            trainer: '',
            detailPath: './pages/plan-balance.html',
            completed: false
        },
        {
            id: 'plan-stretching',
            title: '스트레칭 루틴',
            day: 'mon',
            date: '5월 12일',
            time: '09:30 - 10:00',
            location: '홈 트레이닝',
            priority: '보통',
            trainer: '',
            detailPath: './pages/day.html?day=mon',
            completed: true
        }
    ]
};

function cloneDefault() {
    return JSON.parse(JSON.stringify(defaultData));
}

function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        const initData = cloneDefault();
        saveData(initData);
        return initData;
    }

    try {
        const parsed = JSON.parse(raw);
        return {
            ...defaultData,
            ...parsed,
            user: { ...defaultData.user, ...(parsed.user || {}) },
            challenge: { ...defaultData.challenge, ...(parsed.challenge || {}) },
            timer: { ...defaultData.timer, ...(parsed.timer || {}) },
            plans: Array.isArray(parsed.plans) ? parsed.plans : cloneDefault().plans
        };
    } catch (error) {
        const fallback = cloneDefault();
        saveData(fallback);
        return fallback;
    }
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function dayLabel(day) {
    const map = { sun: '일', mon: '월', tue: '화', wed: '수', thu: '목', fri: '금', sat: '토' };
    return map[day] || day;
}

function toTwoDigits(value) {
    return String(value).padStart(2, '0');
}

function formatSec(totalSec) {
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${toTwoDigits(min)}:${toTwoDigits(sec)}`;
}

function todayLabel() {
    const now = new Date();
    return `${now.getMonth() + 1}월 ${now.getDate()}일`;
}

function ensureToast() {
    let toast = document.getElementById('statusToast');
    if (toast) {
        return toast;
    }

    toast = document.createElement('p');
    toast.id = 'statusToast';
    toast.className = 'status-toast';
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
    return toast;
}

function showToast(message) {
    const toast = ensureToast();
    toast.textContent = message;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 1700);
}

function syncTimerFromElapsed(data) {
    if (!data.timer.running || !data.timer.lastTickAt) {
        return data;
    }

    const elapsed = Math.floor((Date.now() - data.timer.lastTickAt) / 1000);
    if (elapsed <= 0) {
        return data;
    }

    const next = { ...data, timer: { ...data.timer } };
    next.timer.remainingSec = Math.max(0, next.timer.remainingSec - elapsed);
    next.timer.lastTickAt = Date.now();

    if (next.timer.remainingSec === 0) {
        next.timer.running = false;
    }

    return next;
}

function setPlanCompletion(planId, completed) {
    const data = loadData();
    data.plans = data.plans.map((plan) => (plan.id === planId ? { ...plan, completed } : plan));
    saveData(data);
}

function startTimerTick() {
    if (timerIntervalId) {
        window.clearInterval(timerIntervalId);
    }

    timerIntervalId = window.setInterval(() => {
        const data = syncTimerFromElapsed(loadData());
        saveData(data);

        renderTimerUI();

        if (!data.timer.running && data.timer.remainingSec === 0) {
            showToast('타이머가 종료되었습니다.');
            window.clearInterval(timerIntervalId);
            timerIntervalId = null;
        }
    }, 1000);
}

function stopTimerTick() {
    if (timerIntervalId) {
        window.clearInterval(timerIntervalId);
        timerIntervalId = null;
    }
}

function renderTimerUI() {
    const timerViewText = document.getElementById('timerViewText');
    const timerStateText = document.getElementById('timerStateText');

    const data = syncTimerFromElapsed(loadData());
    saveData(data);

    const text = data.timer.durationSec > 0 ? formatSec(data.timer.remainingSec) : '00:00';

    if (timerViewText) {
        timerViewText.textContent = text;
    }

    if (timerStateText) {
        if (data.timer.durationSec === 0) {
            timerStateText.textContent = '타이머 미설정';
        } else if (data.timer.running) {
            timerStateText.textContent = `진행 중 ${text}`;
        } else {
            timerStateText.textContent = `대기 ${text}`;
        }
    }
}

function toggleBottomNavActive() {
    const bottomLinks = document.querySelectorAll('.bottom-nav a');
    if (!bottomLinks.length) {
        return;
    }

    const currentPath = window.location.pathname.split('/').pop();
    bottomLinks.forEach((link) => {
        const href = link.getAttribute('href') || '';
        if (href.includes(currentPath)) {
            bottomLinks.forEach((item) => item.classList.remove('active'));
            link.classList.add('active');
        }
    });
}

function bindStandalonePlanCompleteButtons() {
    document.querySelectorAll('[data-plan-complete]').forEach((button) => {
        const planId = button.getAttribute('data-plan-complete');
        if (!planId) {
            return;
        }

        const data = loadData();
        const plan = data.plans.find((item) => item.id === planId);
        button.classList.toggle('is-done', Boolean(plan && plan.completed));
        button.textContent = plan && plan.completed ? '완료됨' : '완료 처리';

        button.addEventListener('click', () => {
            const fresh = loadData();
            const target = fresh.plans.find((item) => item.id === planId);
            if (!target) {
                showToast('연결된 일정을 찾을 수 없습니다.');
                return;
            }

            const next = !target.completed;
            setPlanCompletion(planId, next);
            button.classList.toggle('is-done', next);
            button.textContent = next ? '완료됨' : '완료 처리';
            showToast(next ? '일정 완료 처리!' : '완료 상태 해제');
        });
    });
}

function renderHomePage() {
    const helloText = document.getElementById('helloText');
    if (!helloText) {
        return;
    }

    const data = syncTimerFromElapsed(loadData());

    if (!homeDayInitialized) {
        data.selectedDay = getTodayDayCode();
        homeDayInitialized = true;
    }

    saveData(data);

    helloText.textContent = `안녕하세요, ${data.user.name || '사용자'}님`;
    const todayText = document.getElementById('todayText');
    if (todayText) {
        todayText.textContent = `오늘은 ${todayLabel()}`;
    }

    const challengeTitle = document.getElementById('challengeTitle');
    const challengeDesc = document.getElementById('challengeDesc');
    if (challengeTitle) {
        challengeTitle.textContent = data.challenge.title;
    }
    if (challengeDesc) {
        challengeDesc.textContent = `${data.challenge.description} (완료 ${data.challenge.completedCount}회)`;
    }

    const selectedDay = data.selectedDay || getTodayDayCode();
    renderDayStrip(selectedDay);

    const selectedPlans = data.plans.filter((plan) => plan.day === selectedDay);
    const mainPlan = selectedPlans[0] || null;
    const subPlan = selectedPlans[1] || null;

    const mainMap = {
        title: document.getElementById('mainPlanTitle'),
        date: document.getElementById('mainPlanDate'),
        time: document.getElementById('mainPlanTime'),
        location: document.getElementById('mainPlanLocation'),
        priority: document.getElementById('mainPlanPriority'),
        trainer: document.getElementById('mainPlanTrainer'),
        link: document.getElementById('mainPlanLink'),
        done: document.getElementById('mainPlanDoneBtn')
    };

    const subMap = {
        title: document.getElementById('subPlanTitle'),
        date: document.getElementById('subPlanDate'),
        time: document.getElementById('subPlanTime'),
        location: document.getElementById('subPlanLocation'),
        priority: document.getElementById('subPlanPriority'),
        link: document.getElementById('subPlanLink'),
        done: document.getElementById('subPlanDoneBtn')
    };

    function bindCardPlan(map, plan) {
        if (!map || !plan) {
            const button = map.done.cloneNode(true);
            map.done.replaceWith(button);
            map.done = button;

            map.title.textContent = '해당 날짜 계획이 없습니다';
            map.date.textContent = `${dayLabel(selectedDay)}요일`;
            map.time.textContent = '일정을 추가해보세요';
            map.location.textContent = '-';
            map.priority.textContent = '안내';
            map.link.setAttribute('href', './pages/plans.html');
            map.link.textContent = '일정 추가하기';
            map.done.classList.remove('is-done');
            map.done.textContent = '완료';
            map.done.disabled = true;

            if (map.trainer) {
                map.trainer.textContent = '트레이너 미정';
            }
            return;
        }

        map.title.textContent = plan.title;
        map.date.textContent = plan.date;
        map.time.textContent = plan.time;
        map.location.textContent = plan.location;
        map.priority.textContent = plan.priority;
        map.link.setAttribute('href', plan.detailPath);
        map.link.textContent = '상세 보기';
        map.done.disabled = false;

        if (map.trainer) {
            map.trainer.textContent = plan.trainer || '트레이너 미정';
        }

        map.done.classList.toggle('is-done', plan.completed);
        map.done.textContent = plan.completed ? '완료됨' : '완료';

        const newButton = map.done.cloneNode(true);
        map.done.replaceWith(newButton);
        map.done = newButton;

        map.done.addEventListener('click', () => {
            const fresh = loadData();
            const current = fresh.plans.find((item) => item.id === plan.id);
            if (!current) {
                return;
            }
            const next = !current.completed;
            setPlanCompletion(plan.id, next);
            renderHomePage();
            showToast(next ? '일정 완료 처리!' : '완료 상태 해제');
        });
    }

    bindCardPlan(mainMap, mainPlan);
    bindCardPlan(subMap, subPlan);

    const challengeCard = document.querySelector('.challenge-card');
    if (challengeCard) {
        challengeCard.addEventListener('mousemove', (event) => {
            const rect = challengeCard.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            challengeCard.style.setProperty('--mx', `${x}px`);
            challengeCard.style.setProperty('--my', `${y}px`);
            challengeCard.style.setProperty('--rotX', `${(y - rect.height / 2) / 22}deg`);
            challengeCard.style.setProperty('--rotY', `${(rect.width / 2 - x) / 22}deg`);
        });

        challengeCard.addEventListener('mouseleave', () => {
            challengeCard.style.setProperty('--rotX', '0deg');
            challengeCard.style.setProperty('--rotY', '0deg');
        });
    }

    bindOnboarding();
    bindTimerActions();
    renderTimerUI();
}

function renderDayStrip(selectedDay) {
    const dayStrip = document.getElementById('dayStrip');
    if (!dayStrip) {
        return;
    }

    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());

    const codes = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    dayStrip.innerHTML = '';

    for (let i = 0; i < 7; i += 1) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const code = codes[date.getDay()];

        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = `day-pill ${code === selectedDay ? 'active' : ''}`;
        pill.dataset.day = code;
        pill.innerHTML = `<span>${dayLabel(code)}</span><strong>${date.getDate()}</strong>`;

        const isToday =
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate();

        if (isToday) {
            pill.classList.add('is-today');
        }

        pill.addEventListener('click', () => {
            const nextData = loadData();
            nextData.selectedDay = code;
            saveData(nextData);
            renderHomePage();
        });

        dayStrip.appendChild(pill);
    }

    const activePill = dayStrip.querySelector('.day-pill.active');
    if (activePill) {
        activePill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
}

function bindOnboarding() {
    const modal = document.getElementById('onboardingModal');
    const form = document.getElementById('onboardingForm');
    const nameInput = document.getElementById('onboardingNameInput');
    if (!modal || !form || !nameInput) {
        return;
    }

    const data = loadData();
    const needOnboard = !data.user.onboarded || !data.user.name;
    modal.classList.toggle('show', needOnboard);
    modal.setAttribute('aria-hidden', needOnboard ? 'false' : 'true');

    if (!needOnboard || form.dataset.bound === 'true') {
        return;
    }

    form.dataset.bound = 'true';
    nameInput.focus();

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = nameInput.value.trim();
        if (!name) {
            return;
        }

        const fresh = loadData();
        fresh.user.name = name;
        fresh.user.onboarded = true;
        saveData(fresh);

        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        renderHomePage();
        showToast(`${name}님, 환영합니다!`);
    });
}

function bindTimerActions() {
    const modal = document.getElementById('timerModal');
    const openButtons = document.querySelectorAll('[data-timer-open], [data-timer-preset]');
    const timerForm = document.getElementById('timerForm');
    const minutesInput = document.getElementById('timerMinutesInput');
    const startBtn = document.getElementById('timerStartBtn');
    const pauseBtn = document.getElementById('timerPauseBtn');
    const resetBtn = document.getElementById('timerResetBtn');
    const closeBtn = document.getElementById('timerCloseBtn');

    if (!modal || !timerForm || !minutesInput || !startBtn || !pauseBtn || !resetBtn || !closeBtn) {
        return;
    }

    if (timerForm.dataset.bound === 'true') {
        return;
    }
    timerForm.dataset.bound = 'true';

    const openModal = (presetMinute) => {
        if (presetMinute) {
            minutesInput.value = String(presetMinute);
        }
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        renderTimerUI();
    };

    const closeModal = () => {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
    };

    openButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const preset = Number(button.getAttribute('data-timer-preset') || '0');
            openModal(preset || null);
        });
    });

    timerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const minute = Number(minutesInput.value);
        if (!Number.isFinite(minute) || minute < 1 || minute > 180) {
            showToast('1~180분 사이로 입력해주세요.');
            return;
        }

        const data = loadData();
        data.timer.durationSec = minute * 60;
        data.timer.remainingSec = minute * 60;
        data.timer.running = false;
        data.timer.lastTickAt = null;
        saveData(data);
        renderTimerUI();
        showToast(`${minute}분 타이머가 설정되었습니다.`);
    });

    startBtn.addEventListener('click', () => {
        const data = loadData();
        if (!data.timer.durationSec) {
            showToast('먼저 시간을 설정해주세요.');
            return;
        }
        data.timer.running = true;
        data.timer.lastTickAt = Date.now();
        saveData(data);
        startTimerTick();
        renderTimerUI();
    });

    pauseBtn.addEventListener('click', () => {
        const synced = syncTimerFromElapsed(loadData());
        synced.timer.running = false;
        synced.timer.lastTickAt = null;
        saveData(synced);
        stopTimerTick();
        renderTimerUI();
    });

    resetBtn.addEventListener('click', () => {
        const data = loadData();
        data.timer.running = false;
        data.timer.remainingSec = data.timer.durationSec;
        data.timer.lastTickAt = null;
        saveData(data);
        stopTimerTick();
        renderTimerUI();
        showToast('타이머를 초기화했습니다.');
    });

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
}

function renderPlansPage() {
    const plansList = document.getElementById('plansList');
    if (!plansList) {
        return;
    }

    const data = loadData();
    plansList.innerHTML = '';

    data.plans.forEach((plan) => {
        const li = document.createElement('li');
        li.className = 'data-list-item';
        li.innerHTML = `
            <a href="${plan.detailPath}">${plan.title}</a>
            <span>${dayLabel(plan.day)} / ${plan.time} / ${plan.location} / ${plan.priority}</span>
            <div class="button-row">
                <button type="button" class="done-btn ${plan.completed ? 'is-done' : ''}" data-action="toggle" data-plan-id="${plan.id}">${plan.completed ? '완료됨' : '완료'}</button>
                <button type="button" class="inline-btn ghost" data-action="edit" data-plan-id="${plan.id}">수정</button>
                <button type="button" class="inline-btn ghost danger" data-action="delete" data-plan-id="${plan.id}">삭제</button>
            </div>
        `;
        plansList.appendChild(li);
    });

    if (!plansList.dataset.bound) {
        plansList.dataset.bound = 'true';
        plansList.addEventListener('click', (event) => {
            const button = event.target.closest('button[data-action]');
            if (!button) {
                return;
            }

            const action = button.getAttribute('data-action');
            const planId = button.getAttribute('data-plan-id');
            const fresh = loadData();
            const targetPlan = fresh.plans.find((plan) => plan.id === planId);
            if (!targetPlan) {
                return;
            }

            if (action === 'toggle') {
                setPlanCompletion(planId, !targetPlan.completed);
                renderPlansPage();
                return;
            }

            if (action === 'delete') {
                const ok = window.confirm('이 일정을 삭제할까요?');
                if (!ok) {
                    return;
                }
                fresh.plans = fresh.plans.filter((plan) => plan.id !== planId);
                saveData(fresh);
                renderPlansPage();
                showToast('일정을 삭제했습니다.');
                return;
            }

            if (action === 'edit') {
                openPlanEditForm(targetPlan);
            }
        });
    }

    bindPlanCreateForm();
    bindPlanEditForm();
}

function bindPlanCreateForm() {
    const planForm = document.getElementById('planForm');
    if (!planForm || planForm.dataset.bound === 'true') {
        return;
    }

    planForm.dataset.bound = 'true';
    planForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const title = document.getElementById('planTitleInput').value.trim();
        const day = document.getElementById('planDayInput').value.trim().toLowerCase();
        const time = document.getElementById('planTimeInput').value.trim();
        const location = document.getElementById('planLocationInput').value.trim();
        const priority = document.getElementById('planPriorityInput').value.trim();

        if (!title || !day || !time || !location || !priority) {
            return;
        }

        const fresh = loadData();
        const newPlan = {
            id: `plan-${Date.now()}`,
            title,
            day,
            date: todayLabel(),
            time,
            location,
            priority,
            trainer: '',
            detailPath: `./day.html?day=${day}`,
            completed: false
        };
        fresh.plans.unshift(newPlan);
        saveData(fresh);
        planForm.reset();
        renderPlansPage();
        showToast('새 일정이 추가되었습니다.');
    });
}

function openPlanEditForm(plan) {
    const form = document.getElementById('planEditForm');
    if (!form) {
        return;
    }

    form.classList.remove('hidden');
    document.getElementById('editPlanIdInput').value = plan.id;
    document.getElementById('editPlanTitleInput').value = plan.title;
    document.getElementById('editPlanDayInput').value = plan.day;
    document.getElementById('editPlanTimeInput').value = plan.time;
    document.getElementById('editPlanLocationInput').value = plan.location;
    document.getElementById('editPlanPriorityInput').value = plan.priority;
}

function bindPlanEditForm() {
    const form = document.getElementById('planEditForm');
    const cancelBtn = document.getElementById('planEditCancelBtn');
    if (!form || form.dataset.bound === 'true') {
        return;
    }

    form.dataset.bound = 'true';

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const id = document.getElementById('editPlanIdInput').value;
        const title = document.getElementById('editPlanTitleInput').value.trim();
        const day = document.getElementById('editPlanDayInput').value.trim().toLowerCase();
        const time = document.getElementById('editPlanTimeInput').value.trim();
        const location = document.getElementById('editPlanLocationInput').value.trim();
        const priority = document.getElementById('editPlanPriorityInput').value.trim();

        if (!id || !title || !day || !time || !location || !priority) {
            return;
        }

        const data = loadData();
        data.plans = data.plans.map((plan) => (
            plan.id === id
                ? {
                    ...plan,
                    title,
                    day,
                    time,
                    location,
                    priority,
                    detailPath: plan.detailPath.startsWith('./day.html') ? `./day.html?day=${day}` : plan.detailPath
                }
                : plan
        ));
        saveData(data);
        form.classList.add('hidden');
        form.reset();
        renderPlansPage();
        showToast('일정이 수정되었습니다.');
    });

    cancelBtn.addEventListener('click', () => {
        form.classList.add('hidden');
    });
}

function renderStatsPage() {
    const doneEl = document.getElementById('statsDone');
    if (!doneEl) {
        return;
    }

    const data = loadData();
    const doneCount = data.plans.filter((plan) => plan.completed).length;
    const pendingCount = data.plans.length - doneCount;
    const rate = data.plans.length ? Math.round((doneCount / data.plans.length) * 100) : 0;

    doneEl.textContent = `완료한 계획: ${doneCount}개`;
    const pendingEl = document.getElementById('statsPending');
    const rateEl = document.getElementById('statsRate');
    if (pendingEl) {
        pendingEl.textContent = `진행 중: ${pendingCount}개`;
    }
    if (rateEl) {
        rateEl.textContent = `달성률: ${rate}% (챌린지 완료 ${data.challenge.completedCount}회)`;
    }

    const doneValueEl = document.getElementById('statsDoneValue');
    const pendingValueEl = document.getElementById('statsPendingValue');
    const rateValueEl = document.getElementById('statsRateValue');
    const progressFillEl = document.getElementById('statsProgressFill');
    const progressLabelEl = document.getElementById('statsProgressLabel');

    if (doneValueEl) {
        doneValueEl.textContent = String(doneCount);
    }
    if (pendingValueEl) {
        pendingValueEl.textContent = String(pendingCount);
    }
    if (rateValueEl) {
        rateValueEl.textContent = String(rate);
    }
    if (progressFillEl) {
        progressFillEl.style.width = `${rate}%`;
    }
    if (progressLabelEl) {
        progressLabelEl.textContent = `${rate}%`;
    }
}

function renderProfilePage() {
    const profileName = document.getElementById('profileNameText');
    if (!profileName) {
        return;
    }

    const data = loadData();
    profileName.textContent = `이름: ${data.user.name || '미설정'}`;
    document.getElementById('profileRoleText').textContent = `역할: ${data.user.role}`;

    const form = document.getElementById('profileForm');
    if (!form || form.dataset.bound === 'true') {
        return;
    }

    form.dataset.bound = 'true';
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('profileNameInput').value.trim();
        const role = document.getElementById('profileRoleInput').value.trim();
        if (!name || !role) {
            return;
        }
        const fresh = loadData();
        fresh.user = { ...fresh.user, name, role, onboarded: true };
        saveData(fresh);
        profileName.textContent = `이름: ${name}`;
        document.getElementById('profileRoleText').textContent = `역할: ${role}`;
        form.reset();
        showToast('프로필이 저장되었습니다.');
    });
}

function renderDayPage() {
    const dayText = document.getElementById('dayText');
    if (!dayText) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const day = (params.get('day') || 'wed').toLowerCase();
    const data = loadData();
    const plans = data.plans.filter((plan) => plan.day === day);

    dayText.textContent = `${dayLabel(day)}요일 일정 ${plans.length}개가 있습니다.`;

    const dayList = document.getElementById('dayPlansList');
    if (!dayList) {
        return;
    }

    dayList.innerHTML = '';
    plans.forEach((plan) => {
        const li = document.createElement('li');
        li.className = 'data-list-item';
        li.innerHTML = `<a href="${plan.detailPath}">${plan.title}</a><span>${plan.time} / ${plan.location}</span>`;
        dayList.appendChild(li);
    });
}

function renderChallengePage() {
    const titleEl = document.getElementById('challengeDetailTitle');
    if (!titleEl) {
        return;
    }

    const data = loadData();
    const descEl = document.getElementById('challengeDetailDesc');
    titleEl.textContent = data.challenge.title;
    descEl.textContent = `${data.challenge.description} (누적 완료 ${data.challenge.completedCount}회)`;

    const completedPlans = data.plans.filter((plan) => plan.completed).length;
    const statusTextEl = document.getElementById('challengeStatusText');
    const streakEl = document.getElementById('challengeStreak');
    const totalDoneEl = document.getElementById('challengeTotalDone');

    if (statusTextEl) {
        statusTextEl.textContent = completedPlans >= 2 ? '목표 근접' : '진행 중';
    }
    if (streakEl) {
        streakEl.textContent = String(Math.max(1, data.challenge.completedCount));
    }
    if (totalDoneEl) {
        totalDoneEl.textContent = String(data.challenge.completedCount);
    }

    const button = document.getElementById('completeChallengeBtn');
    if (!button || button.dataset.bound === 'true') {
        return;
    }

    button.dataset.bound = 'true';
    button.addEventListener('click', () => {
        const fresh = loadData();
        fresh.challenge.completedCount += 1;
        saveData(fresh);
        renderChallengePage();
        showToast('챌린지를 완료했습니다.');
    });
}

function renderActionPage() {
    const actionText = document.getElementById('actionText');
    if (!actionText) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const type = params.get('type') || 'default';
    const map = {
        alarm: '알림을 10분 전으로 설정했습니다.',
        video: '훈련 영상 재생 페이지로 이동합니다.',
        close: '현재 카드 보기를 닫았습니다.',
        plan: '오늘의 운동 계획을 불러왔습니다.',
        timer: '25분 집중 타이머를 시작했습니다.',
        share: '팀 채팅으로 진행 상황을 공유했습니다.',
        join: '온라인 수업 링크를 활성화했습니다.',
        prep: '준비물 체크리스트를 생성했습니다.'
    };
    actionText.textContent = map[type] || `선택된 액션: ${type}`;
}

function renderSearchPage() {
    const form = document.getElementById('searchForm');
    const resultList = document.getElementById('searchResultList');
    if (!form || !resultList || form.dataset.bound === 'true') {
        return;
    }

    form.dataset.bound = 'true';

    const runSearch = (keyword) => {
        const query = keyword.trim().toLowerCase();
        const data = loadData();
        const hits = data.plans.filter((plan) => plan.title.toLowerCase().includes(query));

        resultList.innerHTML = '';
        if (!query) {
            resultList.innerHTML = '<li><a href="./challenge.html">오늘의 챌린지</a></li><li><a href="./plans.html">전체 일정</a></li>';
            return;
        }

        if (!hits.length) {
            resultList.innerHTML = '<li>검색 결과가 없습니다.</li>';
            return;
        }

        hits.forEach((plan) => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="${plan.detailPath}">${plan.title}</a>`;
            resultList.appendChild(li);
        });
    };

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const input = document.getElementById('searchInput');
        runSearch(input.value);
    });
}

function init() {
    const synced = syncTimerFromElapsed(loadData());
    saveData(synced);

    toggleBottomNavActive();
    bindStandalonePlanCompleteButtons();
    renderHomePage();
    renderPlansPage();
    renderStatsPage();
    renderProfilePage();
    renderDayPage();
    renderChallengePage();
    renderActionPage();
    renderSearchPage();

    if (synced.timer.running) {
        startTimerTick();
    }
}

init();