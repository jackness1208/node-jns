var fs = require('fs'),
    global = require('../lib/global'),
    fs = require('fs'),
    fn = global.fn,
    pg = global.pg,
    inquirer = require("inquirer");

var rename = {
        init: function(){
            var defaultName = pg.projectPath.substr(0, pg.projectPath.length - 1).split('/').pop();
            
            inquirer.prompt([
                {
                    type: 'input',
                    name:'name',
                    message:'请输入动漫名称',
                    default: defaultName
                }
            ], function( answer ) {
                var frontPath = pg.projectPath,
                    name = answer.name;
                
                fs.readdir(frontPath, function(err, list){
                    var total = list.length,
                        count = 0,
                        okCount = 0,
                        errCount = 0,
                        exitCheck = function(){
                            if(total == count){
                                console.info('-----------------------');
                                console.info('共修改文件 ' + (okCount + errCount) + ' 个');
                                console.info('成功：' + okCount + ' , 失败：' + errCount);
                            }
                        };

                    list.forEach(function(file){
                        
                        var myPath = frontPath + file;
                        fs.stat(myPath, function(err, stat){
                            if(!stat || !stat.isDirectory()){

                                // 改名
                                var num, ext;

                                if(file.indexOf('.') != -1){
                                    ext = '.' + file.split(".").pop();
                                }

                                file.replace(/\[\d+\]/g, function(str){
                                    num = str.replace(/^\[/g,'').replace(/\]$/,'');
                                });

                                if(!/mp4|rmvb/ig.test(ext)){
                                    count++;
                                    return exitCheck();
                                }

                                if(num){
                                    fs.renameSync(myPath, frontPath + name + num + ext);
                                    console.info(frontPath + name + num + ext + ' 修改成功 √');
                                    okCount++;
                                } else {
                                    console.error(file + ' 修改失败');
                                    errCount++;
                                }

                                count++;
                                exitCheck();
                            } else {
                                count++;
                                exitCheck();
                            }
                        });
                    });
                });
            });
        },
        help: function(){
            console.log([
                '',
                '  Usage: jns rename <command>',
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
            rename.init();
            break;

        case '-h':
        case '--help':
        default:
            rename.help();
            break;
    }    
    
};

