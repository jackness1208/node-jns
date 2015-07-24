var fs = require('fs'),
    color = require('../lib/colors'),
    fn = require('../lib/global'),
    config = require('../lib/config');

var reptile = {
        init: function(){
            fn.timer.start();
            fn.copyFiles(config.basePath + 'init-files/reptile/', config.projectPath, function(err){
                if(!err){
                    fn.runCMD('npm install', function(){
                        fn.timer.end();
                        fn.msg.line().success('文件初始化完成');

                    }, config.projectPath);
                } else {
                    fn.msg.error(err.message);
                }
            }, /\/psd$/);
        },

        help: function(){
            fn.help({
                usage: 'jns reptile',
                commands: {
                    'init': 'project init'
                },
                options: {
                    '-h, --help': 'output usage information'
                }
            });
        }
    };

module.exports = function(type){
    switch(type){
        case "init":
            reptile.init();
            break;

        default:
            reptile.help();
            break;
    }

    

};


