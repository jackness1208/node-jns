module.exports = function(grunt) {

    var devDependencies: [
            // 'grunt-contrib-jade',
            // 'grunt-prettify',
            // 'grunt-contrib-requirejs',
            // 'grunt-contrib-sass'
        ],
        gruntConfig = {
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
            
            // // sass
            // sass: {
            //     demo: {
            //         files: {
            //             'main.css': 'main.scss',
            //             'widgets.css': 'widgets.scss'
            //         }
            //     }
            // },
            //
            // jade: {
            //     'test': {
            //         options: {
            //             data: function(dest, src){

            //             }
            //         },
            //         files: {
            //             'html/index.html': ['tpl/index.jade']
            //         }
            //     }
            // },
            // prettify: {
            //     'test': {
            //         options: {
            //             "indent": 4,
            //             "condense": true,
            //             "indent_inner_html": true,
            //             "unformatted": [
            //                 "a",
            //                 "pre"
            //             ]
            //         },
            //         files: {
            //             'html/index.html': ['html/index.html']
            //         }
            //     }
            // }

        };

    var taskArr = [];
    for(var key in gruntConfig){
        if(gruntConfig.hasOwnProperty(key)){
            taskArr.push(key);
        }
    }

    // 项目配置
    gruntConfig.pkg = grunt.file.readJSON('package.json');
    grunt.initConfig(gruntConfig);
    

    // 加载任务插件
    devDependencies.forEach(function(taskName){
        grunt.loadNpmTasks(taskName);
    });

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

