module.exports = function(grunt) {

    // 项目配置
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        requirejs: {
            'tieba-index': {
                options: {
                    baseUrl: "js",
                    name: "index-debug",
                    out: "js/index.js",
                    paths: {
                        zepto: 'lib/zepto.min',
                        hiido: 'commons/hiido_click',
                        checkOSAndYYVer: 'checkOSAndYYVer'
                    },
                    shim: {
                        zepto: {
                            exports: '$'
                        },
                        checkOSAndYYVer: {
                            deps: ['zepto']
                        },
                        hiido: {
                            exports: 'hiido'
                        }
                    }

                }
            },
            'tieba-detail': {
                options: {
                    baseUrl: "js",
                    name: "detail-debug",
                    out: "js/detail.js",
                    paths: {
                        zepto: 'lib/zepto.min',
                        lazyload: 'lib/zepto.lazyload.min',
                        checkOSAndYYVer: 'checkOSAndYYVer',
                        hiido: 'commons/hiido_click'
                            // jsBridge: 'lib/WAJavascriptBridge',
                            // yymobile_api: 'http://res0.3g.yystatic.com/js/yymobile_api_v1.2.12.min'
                    },
                    shim: {
                        zepto: {
                            exports: '$'
                        },
                        lazyload: {
                            deps: ['zepto']
                        },
                        checkOSAndYYVer: {
                            deps: ['zepto']
                        },
                        hiido: {
                            exports: 'hiido'
                        }

                    }
                }
            },
            'tieba-editPost': {
                options: {
                    baseUrl: "js",
                    name: "editPost-debug",
                    out: "js/editPost.js",
                    paths: {
                        //plugin
                        // text: 'text',
                        zepto: 'lib/zepto.min',
                        checkOSAndYYVer: 'checkOSAndYYVer',
                        jsBridge: 'lib/WAJavascriptBridge',
                        hiido: 'commons/hiido_click'
                    },

                    shim: {
                        zepto: {
                            exports: '$'
                        },
                        checkOSAndYYVer: {
                            deps: ['zepto']
                        },
                        jsBridge: {
                            exports: 'JsBridge'
                        }
                    }
                }
            },
            'tieba-commentDetail': {
                options: {
                    baseUrl: "js",
                    name: "commentDetail-debug",
                    out: "js/commentDetail.js",
                    paths: {
                        //plugin
                        // text: 'text',
                        zepto: 'lib/zepto.min',
                        lazyload: 'lib/zepto.lazyload.min',
                        hiido: 'commons/hiido_click'
                    },

                    shim: {
                        zepto: {
                            exports: '$'
                        },
                        lazyload: {
                            deps: ['zepto']
                        },
                        hiido: {
                            exports: 'hiido'
                        }
                    }
                }
            },
            'tieba-css-index': {
                options:{
                    cssIn: 'css/page/p-index.css',
                    out: 'css/index.css'
                }
            },
            'tieba-css-commentDetail': {
                options:{
                    cssIn: 'css/page/p-commentDetail.css',
                    out: 'css/commentDetail.css'
                }
            },
            'tieba-css-default': {
                options:{
                    cssIn: 'css/page/p-default.css',
                    out: 'css/default.css'
                }
            },
            'tieba-css-detail': {
                options:{
                    cssIn: 'css/page/p-detail.css',
                    out: 'css/detail.css'
                }
            },
            'tieba-css-edit-manage': {
                options:{
                    cssIn: 'css/page/p-edit-manage.css',
                    out: 'css/edit-manage.css'
                }
            },
            'tieba-css-editPost': {
                options:{
                    cssIn: 'css/page/p-editPost.css',
                    out: 'css/editPost.css'
                }
            },
            'tieba-css-emotions': {
                options:{
                    cssIn: 'css/page/p-emotions.css',
                    out: 'css/emotions.css'
                }
            },
            'tieba-css-likeList': {
                options:{
                    cssIn: 'css/page/p-likeList.css',
                    out: 'css/likeList.css'
                }
            },
            'tieba-css-post': {
                options:{
                    cssIn: 'css/page/p-post.css',
                    out: 'css/post.css'
                }
            },
            'tieba-css-replyFloor': {
                options:{
                    cssIn: 'css/page/p-replyFloor.css',
                    out: 'css/replyFloor.css'
                }
            },
            'tieba-css-user-manage': {
                options:{
                    cssIn: 'css/page/p-user-manage.css',
                    out: 'css/user-manage.css'
                }
            }
        },
        
        copy: {
            'tieba': {
                files: [
                    {expand: true, src: ['js/**'], dest: '../../../../../../static/resource/mobile/'},
                    {expand: true, src: ['css/**'], dest: '../../../../../../static/resource/mobile/'},
                    {expand: true, src: ['images/**'], dest: '../../../../../../static/resource/mobile/'}
                ]
            }
        }
    });
    

    // 加载提供"uglify"任务的插件
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    // 加载提供"copy"任务的插件
    grunt.loadNpmTasks('grunt-contrib-copy');

    
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
        if (name) {
            grunt.task.run(['requirejs:' + name, 'copy']);

        } else {
            grunt.task.run(['requirejs', 'copy']);

        }
    });
    grunt.registerTask('default', helpFile);
    grunt.registerTask('-h', helpFile);

    
}
