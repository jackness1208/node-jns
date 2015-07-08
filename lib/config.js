var fn = require('./global'),
    os = require('os');

// 全局变量
var config = {
        isWindows: process.platform == 'win32',
        // 当前cmd 所在地址
        projectPath: fn.formatPath(process.cwd() + '/'),
        // 本程序根目录
        basePath: fn.formatPath(__dirname + '/../'),
        // server 根目录
        serverPath: fn.formatPath(process.env[process.platform == 'win32'? 'USERPROFILE': 'HOME'] + '/.jns/'),

        serverAdress: (function(){
            var ipObj = os.networkInterfaces(),
                ipArr;
            for(var key in ipObj){
                if(ipObj.hasOwnProperty(key)){
                    ipArr = ipObj[key];
                    for(var fip, i = 0, len = ipArr.length; i < len; i++){
                        fip = ipArr[i];
                        if(fip.family.toLowerCase() == 'ipv4' && !fip.internal){
                            return fip.address;
                        }
                    }
                }
            }
            
            return '127.0.0.1';
        })()
    };

module.exports = config;
