var color = require('../lib/colors'),
    global = require('../lib/global'),
    fs = require('fs'),
    fn = global.fn,
    pg = global.pg;

var mod = {
        init: function(){
            fn.copyPathFiles(pg.basePath + 'init-files/modUi/mod/', pg.projectPath, function(err){
                if(!err){
                    fn.msg.line().success('文件初始化完成');
                } else {
                    fn.msg.error(err.message);
                }
            }, /\/psd$/);
        },

        help: function(){
            console.log([
                '',
                '  Usage: jns mod <command>',
                '',
                '  Commands:',
                '',
                '    init   project init',
                '',
                '  Options:',
                '',
                '    -h, --help      output usage information',
                ''
            ].join("\n"));
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


