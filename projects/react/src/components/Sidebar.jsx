export default function Sidebar({ activeMenu, onMenuChange }) {
    const menu = [
        { id: 'meal-plan', label: '식단 플랜', icon: '▣' },
        { id: 'progress', label: '진행 현황', icon: '◷' },
        { id: 'recipes', label: '레시피 라운지', icon: '✦' }
    ];

    return (
        <aside className="planner-sidebar">
            <div className="brand-block">
                <div className="brand-mark" aria-hidden="true"></div>
                <h1>MealSpot</h1>
            </div>

            <section className="profile-card">
                <h2>마카롱여사</h2>
                <p>식단관리 레벨 43</p>
                <div className="profile-stats">
                    <div><strong>2,450</strong><span>팔로워</span></div>
                    <div><strong>10,450</strong><span>활동</span></div>
                </div>
            </section>

            <nav className="sidebar-menu" aria-label="사이드 메뉴">
                {menu.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        className={`menu-item ${activeMenu === item.id ? 'active' : ''}`}
                        onClick={() => onMenuChange(item.id)}
                    >
                        <span className="menu-icon" aria-hidden="true">{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
}
