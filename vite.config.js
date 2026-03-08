const { resolve } = require('path');
const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

module.exports = defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                landing: resolve(__dirname, 'landing/index.html'),
                vanillaHome: resolve(__dirname, 'projects/vanilla/index.html'),
                vanillaList: resolve(__dirname, 'projects/vanilla/board-list.html'),
                vanillaView: resolve(__dirname, 'projects/vanilla/board-view.html'),
                vanillaWrite: resolve(__dirname, 'projects/vanilla/board-write.html'),
                vanillaMainPage: resolve(__dirname, 'src/pages/main/main.html'),
                vanillaPostListPage: resolve(__dirname, 'src/pages/post-list/list.html'),
                vanillaPostDetailPage: resolve(__dirname, 'src/pages/post-detail/detail.html'),
                vanillaWritePage: resolve(__dirname, 'src/pages/write/write.html'),
                vanillaLoginPage: resolve(__dirname, 'src/pages/login/login.html'),
                vanillaMypage: resolve(__dirname, 'src/pages/mypage/mypage.html'),
                vanillaProfile: resolve(__dirname, 'src/pages/profile/profile.html'),
                react: resolve(__dirname, 'projects/react/index.html'),
                viewHome: resolve(__dirname, 'projects/view/index.html'),
                viewAction: resolve(__dirname, 'projects/view/pages/action.html'),
                viewChallenge: resolve(__dirname, 'projects/view/pages/challenge.html'),
                viewDay: resolve(__dirname, 'projects/view/pages/day.html'),
                viewPlanBalance: resolve(__dirname, 'projects/view/pages/plan-balance.html'),
                viewPlanJudo: resolve(__dirname, 'projects/view/pages/plan-judo.html'),
                viewPlans: resolve(__dirname, 'projects/view/pages/plans.html'),
                viewProfile: resolve(__dirname, 'projects/view/pages/profile.html'),
                viewSearch: resolve(__dirname, 'projects/view/pages/search.html'),
                viewStats: resolve(__dirname, 'projects/view/pages/stats.html')
            }
        }
    }
});
