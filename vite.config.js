import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
function pathResolve(dir) {
    return resolve(process.cwd(), '.', dir);
}
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());
    console.log(env);
    return {
        base: '/myroom/',
        plugins: [
            // have to
            vue(),
            // have to
            vueJsx(),
        ],
        resolve: {
            alias: [
                {
                    find: /\/#\//,
                    replacement: pathResolve('types') + '/',
                },
                {
                    find: '@',
                    replacement: pathResolve('src') + '/',
                },
            ],
        },
    };
});
//# sourceMappingURL=vite.config.js.map