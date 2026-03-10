const { resolve } = require('path');
const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

module.exports = defineConfig({
    plugins: [react()],
    base: '/hybrid-web-lab/',
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
                vueHome: resolve(__dirname, 'projects/vue/index.html'),
                vueAction: resolve(__dirname, 'projects/vue/pages/action.html'),
                vueChallenge: resolve(__dirname, 'projects/vue/pages/challenge.html'),
                vueDay: resolve(__dirname, 'projects/vue/pages/day.html'),
                vuePlanBalance: resolve(__dirname, 'projects/vue/pages/plan-balance.html'),
                vuePlanJudo: resolve(__dirname, 'projects/vue/pages/plan-judo.html'),
                vuePlans: resolve(__dirname, 'projects/vue/pages/plans.html'),
                vueProfile: resolve(__dirname, 'projects/vue/pages/profile.html'),
                vueSearch: resolve(__dirname, 'projects/vue/pages/search.html'),
                vueStats: resolve(__dirname, 'projects/vue/pages/stats.html')
            }
        }
    }
});
