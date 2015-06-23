var readline = require('readline'),
    color = require('../lib/colors'),
    fs = require('fs'),
    http = require('http'),
    https = require('https');

// 函数方法
var fn = {
        question: function(questionStr, defaultValue, callback){
            var rl = readline.createInterface({
                  input: process.stdin,
                  output: process.stdout,
                  terminal: false
                });
            rl.question('[?] ' + color.yellow(questionStr) + color.gray( " ("+ defaultValue +")" ), function(answer){
                if(answer == ""){
                    answer = defaultValue;
                }

                rl.close();
                callback && callback(answer);
            })
        },

        msg: {
            error: function(txt){
                console.log(color.red('[error] ') + txt);
            },

            success: function(txt){
                console.log(color.blue('[success] ') + txt);
            },

            notice: function(txt){
                console.log('[notice] ' + txt);
            },
            line: function(){
                console.log('----------------------');
                return this;
            },
        },

        copyPathFiles: function(path, toPath, callback, filters){
            var fileTotal = 0,
                walk = function(path, targetPath, done){
                    
                    fs.readdir(path, function(err, list){
                        var pending = list.length;

                        if(!pending){
                            done();
                        }
                        list.forEach(function(item, i){
                            var file = path + item,
                                targetFile = targetPath + item;
                            
                            if(filters && filters.test(file)){
                                pending--;
                                if(!pending){
                                    done();
                                }

                            } else {
                                fs.stat(file, function(err, stat){
                                    if(err){
                                        fn.msg.error(err.message);
                                        return;
                                    }
                                    if(stat.isDirectory()){
                                        if(!fs.existsSync(targetFile)){
                                            fs.mkdirSync(targetFile);
                                            fn.msg.success('文件夹创建成功 - ' +  targetFile);
                                        }
                                        
                                        walk(file + '/', targetFile + '/', function(){
                                            pending--;
                                            if(!pending){
                                                done();
                                            }
                                        });

                                    

                                    } else if(/^\./.test(item)){
                                        pending--;
                                        if(!pending){
                                            done();
                                        }

                                    } else {
                                        fs.writeFileSync(targetFile, fs.readFileSync(file));
                                        fn.msg.success('文件创建成功 - ' + targetFile);
                                        pending--;
                                        if(!pending){
                                            done();
                                        }
                                    }
                                });
                            }
                        });
                    });
                };
            walk(path, toPath, callback);
        },
        
        formatPath: function(path){
            return path? path.replace(/\\/g,"/"): '';
        },

        /**
         * 运行 cmd
         * @param  {String|Array} str           cmd执行语句 or 数组
         * @param  {funciton}     callback      回调函数
         *                        - json.status 状态码 1:成功, 0:失败
         *                        - json.error  错误信息
         * @return {Void}
         */
        runCMD: function(str, callback){
            var myCmd = require('child_process').exec,
                r = {
                    status:0,
                    error:''
                },
                child;
            if (!str) {
                r.error = '没任何 cmd 操作';
                return callback(r);
                
            }
            if (!/Array/.test(Object.prototype.toString.call(str))) {
                str = [str];
            }

            child = myCmd(str.join(" && "),{
                maxBuffer: 2000 * 1024
            }, function(err, stdout, stderr){
                if(err){
                    // r.error = err.stack.replace(/(\r|\n|\t)+/g,';').replace(/\s+/g,' ').replace(/:[^;:]+;/g,':');
                    console.log('cmd运行 出错');
                    console.log(err.stack);
                    r.error = 'cmd运行 出错';
                    return callback(r);
                    
                } else {
                    r.status = 1;
                    return callback(r);
                }

            });
            child.stdout.setEncoding('utf8');
            
        },

        
        
        /**
         * @param {string}   method    get|post|patch|delete|put
         * @param {string}   src       请求的地址
         * @param {object}   query     query object
         * @param {function} callback  回调函数
         * @param {string}   type      返回数据格式
         */
        ajax: function(){
            var method = arguments[0],
                src = arguments[1],
                callback,
                obj = undefined,
                type = '';

            switch(typeof arguments[2]){
                case 'function':
                    callback = arguments[2];
                    break;
                case 'object':
                    obj = arguments[2];
                    break;
                default:
                    break;
            }

            switch(typeof arguments[3]){
                case 'function':
                    callback = arguments[3];
                    break;

                case 'string':
                    type = arguments[3];

                default:
                    break;
            }
            
            switch(typeof arguments[4]){
                case 'string':
                    type = arguments[4];

                default:
                    break;
            }

            if(obj){
                src += (~src.indexOf('?')? '?': '&') + require('querystring').stringify(obj);
            }


            var uri = require('url').parse(src),
                data = uri.query || '',
                opt = {
                    method: method.toUpperCase(),
                    host: uri.host,
                    port: uri.port || 80,
                    path: uri.pathname,
                    headers:{
                        "Content-Type": 'application/x-www-form-urlencoded',  
                        "Content-Length": data.length  
                    }
                },
                ajaxHandle = function(result){
                    var chunks = [],
                        size = 0;

                    result.on('data', function(chunk){
                        size += chunk.length;
                        chunks.push(chunk);

                    });

                    result.on('end', function(){
                        var myBuffer = Buffer.concat(chunks, size),
                            r;

                        switch(type){
                            case 'json':
                                r = JSON.parse(myBuffer.toString());
                                break;

                            case 'buffer':
                                r = myBuffer;
                                break;
                                
                            default:
                                r = myBuffer.toString();
                                break;
                        }
                        callback && callback(r);
                    });
                },
                myReq = uri.protocol == 'https'? https.request(opt, ajaxHandle) : http.request(opt, ajaxHandle);
            
            console.log(uri);
            fn.msg.notice('['+ method.toUpperCase() +'] ' + src);
            myReq.write(data);
            myReq.end();

        },
        get: function(){
            var myArgv = ['get'];
            for(var i = 0, len = arguments.length; i < len; i++){
                myArgv.push(arguments[i]);
            }
            this.ajax.apply(this, myArgv);
        },

        post: function(){
            var myArgv = ['post'];
            for(var i = 0, len = arguments.length; i < len; i++){
                myArgv.push(arguments[i]);
            }
            this.ajax.apply(this, myArgv);
        }
    },
    // 全局变量
    pg = {
        // 当前cmd 所在地址
        projectPath: fn.formatPath(process.cwd() + '/'),
        // 本程序根目录
        basePath: fn.formatPath(__dirname + '/../')
    };

module.exports = {
    'fn': fn,
    'pg': pg
};

