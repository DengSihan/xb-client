import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite';

const path = require('path');

export default ({ mode }) => {

    process.env = {
        ...process.env,
        ...loadEnv(mode, process.cwd())
    };

    return defineConfig({

        base: process.env.VITE_APP_BASE,
    
        resolve: {
            alias: {
                '~': path.resolve(__dirname, './src'),
            },
            dedupe: [
                'vue'
            ],
        },

        // for those who develop in a virtual machine
        server: {
            host: '0.0.0.0',
            watch: {
                usePolling: true,
            },
            hmr: {
                host: process.env.VITE_APP_HOST,
            },
        },

        plugins: [
            vue(),
        ],

        // build: {
        //     // sourcemap: true
        //     lib: {
        //         entry: path.resolve(__dirname, 'src/main.js'),
        //         name: 'index',
        //         fileName: format => `index.${format}.js`,
        //     },
        // },

        // build: {
        //     rollupOptions: {
        //         output: {
        //             entryFileNames: `assets/[name].js`,
        //             chunkFileNames: `assets/[name].js`,
        //             assetFileNames: `assets/[name].[ext]`
        //         }
        //     }
        // },
    })
};