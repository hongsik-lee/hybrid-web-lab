export default function Topbar({ viewMode, onViewModeChange, searchKeyword, onSearchKeywordChange, onOpenAddModal }) {
    return (
        <header className="planner-topbar">
            <label className="view-select" htmlFor="viewMode">
                <span>보기:</span>
                <select
                    id="viewMode"
                    value={viewMode}
                    onChange={(event) => onViewModeChange(event.target.value)}
                >
                    <option value="week">전체 주간</option>
                    <option value="workdays">평일</option>
                    <option value="focus">집중 요일</option>
                </select>
            </label>

            <div className="quick-tools" role="group" aria-label="빠른 도구">
                <button type="button" aria-label="보드 보기">▦</button>
                <button type="button" aria-label="리스트 보기">☰</button>
                <button type="button" onClick={onOpenAddModal} aria-label="식단 추가">✎</button>
            </div>

            <label className="search-box" htmlFor="mealSearch">
                <input
                    id="mealSearch"
                    type="search"
                    placeholder="식단 검색"
                    value={searchKeyword}
                    onChange={(event) => onSearchKeywordChange(event.target.value)}
                />
                <span aria-hidden="true">⌕</span>
            </label>
        </header>
    );
}
