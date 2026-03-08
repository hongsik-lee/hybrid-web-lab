import { useEffect, useState } from 'react';
import { DAYS } from '../data.js';

const DAY_LABELS_KR = {
    mon: '월요일',
    tue: '화요일',
    wed: '수요일',
    thu: '목요일',
    fri: '금요일'
};

export default function AddMealModal({ isOpen, onClose, onSubmit }) {

    const [form, setForm] = useState({
        day: 'mon',
        mealType: 'Breakfast',
        title: '',
        items: '',
        time: '08:00'
    });

    useEffect(() => {
        if (!isOpen) {
            return;
        }
        setForm({ day: 'mon', mealType: 'Breakfast', title: '', items: '', time: '08:00' });
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!form.title.trim() || !form.items.trim()) {
            return;
        }

        onSubmit({
            day: form.day,
            mealType: form.mealType,
            title: form.title.trim(),
            time: form.time,
            items: form.items.split(',').map((item) => item.trim()).filter(Boolean)
        });
        onClose();
    };

    return (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="식단 추가">
            <form className="add-meal-modal" onSubmit={handleSubmit}>
                <h3>식단 추가</h3>

                <label>
                    요일
                    <select name="day" value={form.day} onChange={handleChange}>
                        {DAYS.map((day) => (
                            <option key={day.key} value={day.key}>{DAY_LABELS_KR[day.key] || day.label}</option>
                        ))}
                    </select>
                </label>

                <label>
                    타입
                    <select name="mealType" value={form.mealType} onChange={handleChange}>
                        <option value="Breakfast">아침</option>
                        <option value="Lunch">점심</option>
                        <option value="Dinner">저녁</option>
                        <option value="Snack">간식</option>
                    </select>
                </label>

                <label>
                    제목
                    <input name="title" value={form.title} onChange={handleChange} placeholder="예: 단백질 샐러드" />
                </label>

                <label>
                    시간
                    <input name="time" type="time" value={form.time} onChange={handleChange} />
                </label>

                <label>
                    재료 (쉼표 구분)
                    <textarea name="items" value={form.items} onChange={handleChange} rows="3" placeholder="닭가슴살, 양상추, 토마토" />
                </label>

                <div className="modal-actions">
                    <button type="button" className="ghost" onClick={onClose}>취소</button>
                    <button type="submit">저장</button>
                </div>
            </form>
        </div>
    );
}
