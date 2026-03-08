export const DAYS = [
    { key: 'mon', label: 'Monday' },
    { key: 'tue', label: 'Tuesday' },
    { key: 'wed', label: 'Wednesday' },
    { key: 'thu', label: 'Thursday' },
    { key: 'fri', label: 'Friday' }
];

export const INITIAL_MEALS = {
    mon: [
        {
            id: 'mon-breakfast-1',
            mealType: 'Breakfast',
            title: '오트밀 볼',
            items: ['오트밀 1컵', '바나나 1개', '저지방 우유 200ml'],
            time: '08:30',
            likes: 23,
            comments: 5,
            liked: false,
            done: false
        },
        {
            id: 'mon-lunch-1',
            mealType: 'Lunch',
            title: '닭가슴살 샐러드',
            items: ['닭가슴살 150g', '로메인', '방울토마토', '올리브오일'],
            time: '12:10',
            likes: 11,
            comments: 2,
            liked: false,
            done: true
        }
    ],
    tue: [
        {
            id: 'tue-breakfast-1',
            mealType: 'Breakfast',
            title: '스크램블 에그 플레이트',
            items: ['계란 3개', '통밀 토스트 1장', '사과 1개'],
            time: '07:50',
            likes: 15,
            comments: 4,
            liked: false,
            done: false
        },
        {
            id: 'tue-dinner-1',
            mealType: 'Dinner',
            title: '연어 스테이크',
            items: ['연어 200g', '아스파라거스', '현미밥 반 공기'],
            time: '19:20',
            likes: 18,
            comments: 6,
            liked: true,
            done: false
        }
    ],
    wed: [
        {
            id: 'wed-breakfast-1',
            mealType: 'Breakfast',
            title: '그릭요거트 & 블루베리',
            items: ['그릭요거트 200g', '블루베리 반 컵', '아몬드 8알'],
            time: '07:30',
            likes: 9,
            comments: 1,
            liked: false,
            done: true
        },
        {
            id: 'wed-lunch-1',
            mealType: 'Lunch',
            title: '베이글 샌드위치',
            items: ['통밀 베이글', '칠면조 햄', '토마토', '양상추'],
            time: '11:40',
            likes: 26,
            comments: 7,
            liked: false,
            done: false
        }
    ],
    thu: [
        {
            id: 'thu-dinner-1',
            mealType: 'Dinner',
            title: '소고기 채소볶음',
            items: ['우둔살 120g', '브로콜리', '파프리카', '양파'],
            time: '18:50',
            likes: 7,
            comments: 1,
            liked: false,
            done: false
        }
    ],
    fri: []
};
