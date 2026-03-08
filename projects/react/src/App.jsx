const { useState, useEffect } = React;

// Sidebar Component
function Sidebar({ currentPage, setCurrentPage }) {
    const menuItems = [
        { id: 'dashboard', icon: '📊', label: '대시보드' },
        { id: 'analytics', icon: '📈', label: '분석' }
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <span className="logo-icon">⚡</span>
                    <span className="logo-text">Admin</span>
                </div>
            </div>
            <nav className="sidebar-nav">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                        onClick={() => setCurrentPage(item.id)}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </button>
                ))}
            </nav>
            <div className="sidebar-footer">
                <button className="nav-item">
                    <span className="nav-icon">⚙️</span>
                    <span className="nav-label">설정</span>
                </button>
            </div>
        </aside>
    );
}

// StatCard Component
function StatCard({ title, value, icon, color }) {
    return (
        <div className="stat-card">
            <div className="stat-icon" style={{ background: color }}>
                {icon}
            </div>
            <div className="stat-content">
                <h3 className="stat-title">{title}</h3>
                <p className="stat-value">{value.toLocaleString()}</p>
            </div>
        </div>
    );
}

// Calendar Component
function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const days = [];
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === new Date().getDate() && 
                       month === new Date().getMonth() && 
                       year === new Date().getFullYear();
        
        days.push(
            <div
                key={day}
                className={`calendar-day ${isToday ? 'today' : ''}`}
                onClick={() => setSelectedDate(new Date(year, month, day))}
            >
                {day}
            </div>
        );
    }

    return (
        <div className="calendar-widget">
            <div className="calendar-header">
                <button onClick={prevMonth} className="calendar-nav">‹</button>
                <span className="calendar-title">{year}년 {monthNames[month]}</span>
                <button onClick={nextMonth} className="calendar-nav">›</button>
            </div>
            <div className="calendar-weekdays">
                {weekDays.map(day => (
                    <div key={day} className="weekday">{day}</div>
                ))}
            </div>
            <div className="calendar-days">
                {days}
            </div>
        </div>
    );
}

// Chart Component
function Chart() {
    const data = [65, 89, 80, 81, 96, 105, 134];
    const labels = ['월', '화', '수', '목', '금', '토', '일'];
    const maxValue = Math.max(...data);

    return (
        <div className="chart-container">
            <div className="chart-header">
                <h3>포트폴리오 방문자</h3>
                <select className="chart-filter">
                    <option>이번 주</option>
                    <option>이번 달</option>
                    <option>올해</option>
                </select>
            </div>
            <div className="chart">
                <div className="chart-grid">
                    {data.map((value, index) => {
                        const height = (value / maxValue) * 100;
                        return (
                            <div key={index} className="chart-bar-wrapper">
                                <div 
                                    className="chart-bar"
                                    style={{ height: `${height}%` }}
                                    title={`${labels[index]}: ${value}`}
                                >
                                    <span className="chart-value">{value}</span>
                                </div>
                                <span className="chart-label">{labels[index]}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// Schedule Component
function Schedule() {
    const schedules = [
        {
            id: 1,
            time: '10:30 - 11:00',
            title: 'Jean Dominic과 프로젝트 논의',
            tags: ['UI 디자인', '프로토타입']
        },
        {
            id: 2,
            time: '14:00 - 15:30',
            title: '팀 미팅',
            tags: ['기획', '개발']
        }
    ];

    return (
        <div className="schedule-widget">
            <h3>일정</h3>
            <div className="schedule-list">
                {schedules.map(schedule => (
                    <div key={schedule.id} className="schedule-item">
                        <div className="schedule-time">{schedule.time}</div>
                        <div className="schedule-content">
                            <h4>{schedule.title}</h4>
                            <div className="schedule-tags">
                                {schedule.tags.map(tag => (
                                    <span key={tag} className="tag">{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Dashboard Page
function Dashboard() {
    const stats = [
        { title: '클라이언트', value: 1992, icon: '👥', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { title: '진행 중인 작업', value: 43, icon: '📋', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
        { title: '협상 중인 프로젝트', value: 31, icon: '💼', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }
    ];

    return (
        <div className="dashboard-content">
            <header className="page-header">
                <h1>대시보드</h1>
                <div className="page-actions">
                    <button className="btn-icon">🔔</button>
                    <div className="user-avatar">👤</div>
                </div>
            </header>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            <div className="dashboard-grid">
                <div className="chart-section">
                    <Chart />
                </div>
                
                <div className="sidebar-widgets">
                    <Calendar />
                    <Schedule />
                </div>
            </div>
        </div>
    );
}

// Analytics Page
function Analytics() {
    return (
        <div className="dashboard-content">
            <header className="page-header">
                <h1>분석</h1>
                <div className="page-actions">
                    <button className="btn-icon">🔔</button>
                    <div className="user-avatar">👤</div>
                </div>
            </header>

            <div className="analytics-grid">
                <div className="analytics-card">
                    <h3>사용자 활동</h3>
                    <div className="analytics-stat">
                        <span className="stat-number">2,543</span>
                        <span className="stat-label">오늘 방문자</span>
                        <span className="stat-change positive">+12.5%</span>
                    </div>
                </div>

                <div className="analytics-card">
                    <h3>평균 세션 시간</h3>
                    <div className="analytics-stat">
                        <span className="stat-number">4분 32초</span>
                        <span className="stat-label">평균 체류 시간</span>
                        <span className="stat-change positive">+8.2%</span>
                    </div>
                </div>

                <div className="analytics-card">
                    <h3>전환율</h3>
                    <div className="analytics-stat">
                        <span className="stat-number">3.24%</span>
                        <span className="stat-label">이번 달</span>
                        <span className="stat-change negative">-2.1%</span>
                    </div>
                </div>

                <div className="analytics-card full">
                    <h3>주요 지표</h3>
                    <div className="metrics-list">
                        <div className="metric-item">
                            <span className="metric-label">페이지 뷰</span>
                            <span className="metric-value">12,543</span>
                            <div className="metric-bar" style={{width: '85%'}}></div>
                        </div>
                        <div className="metric-item">
                            <span className="metric-label">고유 방문자</span>
                            <span className="metric-value">8,234</span>
                            <div className="metric-bar" style={{width: '65%'}}></div>
                        </div>
                        <div className="metric-item">
                            <span className="metric-label">재방문율</span>
                            <span className="metric-value">42%</span>
                            <div className="metric-bar" style={{width: '42%'}}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Main App
function App() {
    const [currentPage, setCurrentPage] = useState('dashboard');

    return (
        <div className="app">
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <main className="main-content">
                {currentPage === 'dashboard' ? <Dashboard /> : <Analytics />}
            </main>
        </div>
    );
}

// Render App
ReactDOM.render(<App />, document.getElementById('root'));