export default {
    build: {
        chunkSizeWarningLimit: 1500,
        minify: 'terser',
        terserOptions: {
            format: {
                comments: false
            }
        }
    },
    base: './',
}