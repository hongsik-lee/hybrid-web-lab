import MealCard from './MealCard.jsx';

export default function DayColumn({ day, meals, onToggleLike, onToggleDone, onAddItem, onRemoveItem }) {
    return (
        <section className="day-column" aria-label={`${day.label} 식단`}>
            <header className="day-column-head">
                <h3>{day.label}</h3>
                <button type="button" aria-label={`${day.label} 메뉴`}>•••</button>
            </header>

            <div className="day-meals">
                {meals.length === 0 && <p className="empty-message">등록된 식단이 없습니다.</p>}
                {meals.map((meal) => (
                    <MealCard
                        key={meal.id}
                        meal={meal}
                        onToggleLike={() => onToggleLike(day.key, meal.id)}
                        onToggleDone={() => onToggleDone(day.key, meal.id)}
                        onAddItem={(content) => onAddItem(day.key, meal.id, content)}
                        onRemoveItem={(itemIndex) => onRemoveItem(day.key, meal.id, itemIndex)}
                    />
                ))}
            </div>
        </section>
    );
}
