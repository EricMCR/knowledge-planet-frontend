module.exports = {
    devServer: {
        port: 8080,
        proxy: {
            '/api': {
                //target要改为服务所在的服务器IP
                target: 'http://localhost:10010',
                // 允许跨域
                changeOrigin: true,
                ws: true,
                pathRewrite: {
                    '^/api': ''
                }
            }
        }
    }
}