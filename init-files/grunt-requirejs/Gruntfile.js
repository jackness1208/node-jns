module.exports = function(grunt) {

    var 
        gruntConfig = {
            pkg: grunt.file.readJSON('package.json'),

            // // requirejs 压缩 要放在最后， 不然会中断往后的所有任务
            // requirejs: {
            //     'tieba-index': {
            //         options: {
            //             baseUrl: "js",
            //             name: "index-debug",
            //             out: "js/index.js",
            //             paths: {
            //                 zepto: 'lib/zepto.min',
            //                 hiido: 'commons/hiido_click',
            //                 checkOSAndYYVer: 'checkOSAndYYVer'
            //             },
            //             shim: {
            //                 zepto: {
            //                     exports: '$'
            //                 },
            //                 checkOSAndYYVer: {
            //                     deps: ['zepto']
            //                 },
            //                 hiido: {
            //                     exports: 'hiido'
            //                 }
            //             }

            //         }
            //     }
               
            // },
            
            // // uglify 压缩
            // uglify: {
            //     demo: {
            //         options: {
            //             // 放在生成后的压缩文件的头部注释文案
            //             banner: '/*! builded <%= grunt.template.today() %> */\n',
            //             // 生成的map文件地址的 相对路径
            //             sourceMapRoot: '../../',
            //             // 生成 map文件的地址
            //             sourceMap: function(path){
            //                 var f = path.split("/"),
            //                     filename = f.pop(),
            //                     nav = f.join("/") + "/";
            //                 return nav + "map/" +  filename.replace('.js','.map');
            //             },
            //             // 用于定义 map文件地址 并放在压缩文件底部， url相对于 压缩文件
            //             sourceMappingURL: function(path){
            //                 var f = path.split("/"),
            //                     filename = f.pop(),
            //                     nav = f.join("/") + "/";
            //                 return "map/" +  filename.replace('.js','.map');
            //             }
            //         },
            //         files:{
            //             "dist/mix.js":["src/1.js","src/2.js"]
            //         }
            //     }
            // }
            // sass
            // sass: {
            //     'weiweiyou': {
            //         files: [{
            //             expand: true,
            //             cwd: 'sass/',
            //             src: ['*.scss'],
            //             dest: 'css',
            //             ext: '.css'
            //         }]
            //     }
            // },
            
            // jade: {
            //    'weiweiyou': {
            //         options: {
            //             pretty: true,
            //             client: false,
            //             runtime: false
            //         },
            //         files: {
            //             'html/': ['tpl/*.jade']
            //         }
            //     }
            // }

        };

    var taskArr = [];
    for(var key in gruntConfig){
        if(gruntConfig.hasOwnProperty(key) && key != 'pkg'){
            taskArr.push(key);
        }
    }

    // 项目配置
    grunt.initConfig(gruntConfig);

    // 加载任务插件
    for(var key in gruntConfig.pkg.devDependencies){
        if(gruntConfig.pkg.devDependencies.hasOwnProperty(key) && key != 'grunt'){
            grunt.loadNpmTasks(key);

        }
    }

    // help 
    var helpFile = function(){
        console.log([
            '',
            ' Usage: grunt <command>',
            ' ',
            ' Commands:',
            '   build      run the Optimize task',
            '',
            ' Options:',
            '   -h         output usage information',
            '',
            ''
        ].join('\n'));
    };

    // 注册任务
    grunt.registerTask('build', function(name) {
        var r = [];
        if (name) {
            taskArr.forEach(function(taskName){
                r.push(taskName + ":" + name);
            });

        } else {
            r = taskArr;

        }
        grunt.task.run(r);
    });
    grunt.registerTask('default', helpFile);
    grunt.registerTask('-h', helpFile);

}
