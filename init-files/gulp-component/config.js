'use strict';
var config = {
    'proj': {
        src: 'src',
        global: {
            components: '../commons/pc/components',
            lib: '../commons/pc/lib'
        },
        dest: {
            hostname: '..',
            path: {
                'js': 'js',
                'jsLib': 'js/lib',
                'css': 'css',
                'images': 'images',
                'html': 'html'
            },
            // concat: {
            //     'pc/js/headfoot.mix.js': [
            //         'pc/js/headfoot.js',
            //         'pc/js/popup.js',
            //         'pc/js/lib/statistics/statistics.js'
            //     ],
            //     'pc/css/headfoot.mix.css': [
            //         'pc/css/headfoot.css',
            //         'pc/css/popup.css'
            //     ]
            // }
        },
        // git: {
        //     // update: [
        //     //     '{$SRC}/components',
        //     //     '{$SRC}/images',
        //     //     '{$SRC}/js',
        //     //     '{$SRC}/psd',
        //     //     '{$SRC}/sass',
        //     //     '{$SRC}/templates'
        //     // ]
        // },
        
        // svn: {
        //     path: {
        //         dev: '../../../svn.yy.com/yy-music/web-dragon/star-fans/yyweb/branches/develop',
        //         commit: '../../../svn.yy.com/yy-music/web-dragon/star-fans/yyweb/branches/commit',
        //         trunk: '../../../svn.yy.com/yy-music/web-dragon/star-fans/yyweb/trunk'
        //     },
        //     path2: {

        //     },

        //     update: [
        //         '{$PATH}/static',
        //         '{$PATH}/yyweb-web/src/main/webapp/WEB-INF/jsp-tmpl'
        //     ],
        //     copy: {
        //         'dist/pc': [
        //             '{$PATH}/yyweb-web/src/main/webapp/static/pc',
        //             '{$PATH}/static/resource/pc'
        //         ],
        //         '{$PATH}/yyweb-web/src/main/webapp/WEB-INF/jsp-tmpl': [
        //             '{$PATH}/static/jsp-tmpl'
        //         ],

        //         'dist/pc/html/mobileDownload.html': [
        //             '{$PATH}/static/resource/pc/html/original',
        //             '{$PATH}/yyweb-web/src/main/webapp/static/pc/html/original'
        //         ]

        //     },
        //     'commit': [
        //             // '{$SRC}/css',
        //             // '{$SRC}/html',
        //             // 'dist/pc',
        //             '{$PATH}/yyweb-web/src/main/webapp/static/pc/css',
        //             '{$PATH}/yyweb-web/src/main/webapp/static/pc/js',
        //             '{$PATH}/yyweb-web/src/main/webapp/static/pc/html',
        //             '{$PATH}/yyweb-web/src/main/webapp/static/pc/images',
        //             '{$PATH}/yyweb-web/src/main/webapp/WEB-INF/jsp-tmpl/pc/module',
        //             '{$PATH}/static/resource/pc/css',
        //             '{$PATH}/static/resource/pc/js',
        //             '{$PATH}/static/resource/pc/html',
        //             '{$PATH}/static/resource/pc/images',
        //             '{$PATH}/static/jsp-tmpl',
        //     ],
        //     onBeforeCommit: function(type){
        //     }
        // }

    }
};

module.exports = config;
