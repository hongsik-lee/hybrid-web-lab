import { useState } from 'react';

export default function MealCard({ meal, onToggleLike, onToggleDone, onAddItem, onRemoveItem }) {
    const [newItem, setNewItem] = useState('');

    const handleAddItem = (event) => {
        event.preventDefault();
        if (!newItem.trim()) {
            return;
        }
        onAddItem(newItem);
        setNewItem('');
    };

    return (
        <article className={`meal-card ${meal.done ? 'is-done' : ''}`}>
            <header className="meal-card-head">
                <h4>{meal.mealType}</h4>
                <span className="meal-time">{meal.time}</span>
            </header>

            <h5>{meal.title}</h5>

            <ul className={`meal-details ${meal.done ? 'is-collapsed' : ''}`}>
                {meal.items.map((item, index) => (
                    <li key={`${meal.id}-item-${index}`}>
                        <span>{item}</span>
                        <button
                            type="button"
                            className="detail-remove-btn"
                            onClick={() => onRemoveItem(index)}
                            aria-label={`${item} 삭제`}
                        >
                            x
                        </button>
                    </li>
                ))}
            </ul>

            <form className="meal-item-form" onSubmit={handleAddItem}>
                <input
                    type="text"
                    value={newItem}
                    onChange={(event) => setNewItem(event.target.value)}
                    placeholder="내용 추가"
                    aria-label="식단 상세 내용 추가"
                />
                <button type="submit">추가</button>
            </form>

            <footer className="meal-card-actions">
                <button type="button" className={meal.liked ? 'liked' : ''} onClick={onToggleLike}>
                    👍 {meal.likes}
                </button>
                <span>💬 {meal.comments}</span>
                <button type="button" onClick={onToggleDone}>{meal.done ? '상세 보기' : '완료'}</button>
            </footer>
        </article>
    );
}
