module.exports = {
    // 压缩用配置参数
    optimize: {
        // requirejs 压缩
        requirejs: {
            /*
            'js/until.js': 'js/until-debug.js'
            */
        },
        
        // 一般合并压缩
        uglify: {
            /*
            'js/until.js':['js/a.js', 'js/b.js']
            */
        },
        // sass
        sass: {
            /*
            css/main.css:[css/main.sass]
            */
        }
    }
};
