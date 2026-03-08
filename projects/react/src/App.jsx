import { useEffect, useMemo, useState } from 'react';
import { DAYS, INITIAL_MEALS } from './data.js';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import DayColumn from './components/DayColumn.jsx';
import AddMealModal from './components/AddMealModal.jsx';

const DEFAULT_MENU = 'meal-plan';
const VIEW_MODE_LABELS = {
    week: '전체 주간',
    workdays: '평일',
    focus: '집중 요일'
};

function getMenuFromHash() {
    const key = window.location.hash.replace('#/', '').trim();
    const allowed = ['meal-plan', 'progress', 'recipes'];
    return allowed.includes(key) ? key : DEFAULT_MENU;
}

export default function App() {
    const [activeMenu, setActiveMenu] = useState(() => getMenuFromHash());
    const [viewMode, setViewMode] = useState('week');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [focusDay, setFocusDay] = useState('mon');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [mealsByDay, setMealsByDay] = useState(() => {
        return JSON.parse(JSON.stringify(INITIAL_MEALS));
    });

    const normalizedSearch = searchKeyword.trim().toLowerCase();

    const visibleDays = DAYS.filter((day) => {
        if (viewMode === 'workdays') {
            return day.key !== 'fri';
        }
        if (viewMode === 'focus') {
            return day.key === focusDay;
        }
        return true;
    });

    const filteredMealsByDay = visibleDays.reduce((acc, day) => {
        const source = mealsByDay[day.key] || [];
        const nextMeals = source.filter((meal) => {
            if (!normalizedSearch) {
                return true;
            }
            const target = `${meal.title} ${meal.mealType} ${meal.items.join(' ')}`.toLowerCase();
            return target.includes(normalizedSearch);
        });
        acc[day.key] = nextMeals;
        return acc;
    }, {});

    const allMeals = Object.values(mealsByDay).flat();
    const completedCount = allMeals.filter((meal) => meal.done).length;
    const progressPercent = allMeals.length ? Math.round((completedCount / allMeals.length) * 100) : 0;

    const topLikedMeals = useMemo(() => {
        return [...allMeals].sort((a, b) => b.likes - a.likes).slice(0, 5);
    }, [allMeals]);

    useEffect(() => {
        const handleHashChange = () => {
            setActiveMenu(getMenuFromHash());
        };

        if (!window.location.hash) {
            window.location.hash = `/${DEFAULT_MENU}`;
        }

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const changeMenu = (menuId) => {
        setActiveMenu(menuId);
        window.location.hash = `/${menuId}`;
    };

    const toggleLike = (dayKey, mealId) => {
        setMealsByDay((prev) => {
            const next = { ...prev };
            next[dayKey] = (next[dayKey] || []).map((meal) => {
                if (meal.id !== mealId) {
                    return meal;
                }
                const liked = !meal.liked;
                const likes = liked ? meal.likes + 1 : Math.max(0, meal.likes - 1);
                return { ...meal, liked, likes };
            });
            return next;
        });
    };

    const toggleDone = (dayKey, mealId) => {
        setMealsByDay((prev) => {
            const next = { ...prev };
            next[dayKey] = (next[dayKey] || []).map((meal) => {
                if (meal.id !== mealId) {
                    return meal;
                }
                return { ...meal, done: !meal.done };
            });
            return next;
        });
    };

    const addMeal = ({ day, mealType, title, items, time }) => {
        setMealsByDay((prev) => {
            const next = { ...prev };
            const newMeal = {
                id: `${day}-${Date.now()}`,
                mealType,
                title,
                items,
                time,
                likes: 0,
                comments: 0,
                liked: false,
                done: false
            };
            next[day] = [...(next[day] || []), newMeal];
            return next;
        });
    };

    const addMealItem = (dayKey, mealId, content) => {
        const nextItem = content.trim();
        if (!nextItem) {
            return;
        }

        setMealsByDay((prev) => {
            const next = { ...prev };
            next[dayKey] = (next[dayKey] || []).map((meal) => {
                if (meal.id !== mealId) {
                    return meal;
                }
                return { ...meal, items: [...meal.items, nextItem] };
            });
            return next;
        });
    };

    const removeMealItem = (dayKey, mealId, itemIndex) => {
        setMealsByDay((prev) => {
            const next = { ...prev };
            next[dayKey] = (next[dayKey] || []).map((meal) => {
                if (meal.id !== mealId) {
                    return meal;
                }
                return {
                    ...meal,
                    items: meal.items.filter((_, index) => index !== itemIndex)
                };
            });
            return next;
        });
    };

    const renderMealPlanPage = () => (
        <>
            <Topbar
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                searchKeyword={searchKeyword}
                onSearchKeywordChange={setSearchKeyword}
                onOpenAddModal={() => setIsAddModalOpen(true)}
            />

            <section className="planner-summary">
                <article>
                    <h2>주간 진행률</h2>
                    <strong>{progressPercent}%</strong>
                    <p>{completedCount} / {allMeals.length}개 식단 완료</p>
                </article>
                <article>
                    <h2>현재 보기</h2>
                    <strong>{VIEW_MODE_LABELS[viewMode] || viewMode}</strong>
                    <p>필터를 선택해 식단 흐름을 추적해 보세요.</p>
                </article>
            </section>

            <section className="focus-days" aria-label="요일 선택">
                {DAYS.map((day) => (
                    <button
                        key={day.key}
                        type="button"
                        className={focusDay === day.key ? 'active' : ''}
                        onClick={() => {
                            setFocusDay(day.key);
                            setViewMode('focus');
                        }}
                    >
                        {day.label.slice(0, 3)}
                    </button>
                ))}
            </section>

            <section className="planner-grid">
                {visibleDays.map((day) => (
                    <DayColumn
                        key={day.key}
                        day={day}
                        meals={filteredMealsByDay[day.key] || []}
                        onToggleLike={toggleLike}
                        onToggleDone={toggleDone}
                        onAddItem={addMealItem}
                        onRemoveItem={removeMealItem}
                    />
                ))}
            </section>
        </>
    );

    const renderProgressPage = () => (
        <>
            <header className="subpage-head">
                <h2>Progress Studio</h2>
                <p>요일별 완료율을 빠르게 확인하고 이번 주 흐름을 점검하세요.</p>
            </header>

            <section className="planner-summary">
                <article>
                    <h2>완료한 식단</h2>
                    <strong>{completedCount}</strong>
                    <p>이번 주 전체 완료 식단 수</p>
                </article>
                <article>
                    <h2>평균 달성률</h2>
                    <strong>{progressPercent}%</strong>
                    <p>현재 플랜 달성률</p>
                </article>
            </section>

            <section className="subpage-grid" aria-label="요일별 진행도">
                {DAYS.map((day) => {
                    const meals = mealsByDay[day.key] || [];
                    const doneCount = meals.filter((meal) => meal.done).length;
                    const dayPercent = meals.length ? Math.round((doneCount / meals.length) * 100) : 0;

                    return (
                        <article key={day.key} className="subpage-card">
                            <h3>{day.label}</h3>
                            <strong>{dayPercent}%</strong>
                            <p>{doneCount} / {meals.length || 0} 완료</p>
                        </article>
                    );
                })}
            </section>
        </>
    );

    const renderRecipesPage = () => (
        <>
            <header className="subpage-head">
                <h2>Recipe Lounge</h2>
                <p>좋아요가 높은 식단을 보고, 자주 쓰는 재료를 빠르게 추가해 보세요.</p>
            </header>

            <section className="subpage-grid" aria-label="인기 식단">
                {topLikedMeals.map((meal) => (
                    <article key={meal.id} className="subpage-card">
                        <h3>{meal.title}</h3>
                        <p>{meal.mealType} · {meal.time}</p>
                        <strong>👍 {meal.likes}</strong>
                    </article>
                ))}
            </section>
        </>
    );

    const renderPageByMenu = () => {
        if (activeMenu === 'progress') {
            return renderProgressPage();
        }
        if (activeMenu === 'recipes') {
            return renderRecipesPage();
        }
        return renderMealPlanPage();
    };

    return (
        <div className="planner-app">
            <Sidebar activeMenu={activeMenu} onMenuChange={changeMenu} />

            <main className="planner-main">
                {renderPageByMenu()}
            </main>

            <AddMealModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={addMeal}
            />
        </div>
    );
}