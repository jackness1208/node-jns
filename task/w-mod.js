var fs = require('fs'),
    color = require('../lib/colors'),
    fn = require('../lib/global'),
    config = require('../lib/config');

var mod = {
        init: function(){
            fn.copyPathFiles(config.basePath + 'init-files/modUi/mod/', config.projectPath, function(err){
                if(!err){
                    fn.msg.line().success('文件初始化完成');
                } else {
                    fn.msg.error(err.message);
                }
            }, /\/psd$/);
        },

        help: function(){
            fn.help({
                usage: 'jns mod',
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
            mod.init();
            break;

        default:
            mod.help();
            break;
    }

    

};


