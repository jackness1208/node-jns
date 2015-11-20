var readline = require('readline'),
    color = require('./colors'),
    fs = require('fs'),
    http = require('http'),
    https = require('https');

// 函数方法
var fn = {
        /**
         * question
         * @param  {String}   questionStr   问题文本
         * @param  {String}   defaultValue  缺省答案
         * @param  {function} callback      回调方法
         * @return {Void}
         */
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
        /**
         * 日期格式化
         * @param  {Date|String} date 日期字符串
         * @return {string} 日期
         */
        dateFormat: function(date){
            var myDate = new Date(date);
            if(myDate.getDate()){
                return myDate.getFullYear() + '-' + (myDate.getMonth() + 1 < 10 ? '0' + (myDate.getMonth() + 1): (myDate.getMonth() + 1) ) + '-' + (myDate.getDate() < 10? '0' + myDate.getDate(): myDate.getDate());
            } else {
                return '';
            }
        },

        /**
         * 计时器
         */
        timer: {///{
            now: undefined,
            total: 0,
            // 点出现的间隔（以文件为单位）
            interval: 5,
            
            // 计时器 开始
            start: function(){
                var she = this;
                she.total = 0;
                she.now = new Date();
            },
            
            // 计时器打点记录
            mark: function(){
                var she = this;
                if(!she.now){
                    return;
                }
                she.total++;

                if(she.total == 1){
                    fn.msg.nowrap(color.green('* '));
                }

                she.total % she.interval && (
                    fn.msg.nowrap('.')
                );
            },
            // 计时器结束
            end: function(){
                var she = this;
                if(she.now){
                    fn.msg.nowrap(color.green(' ' + (new Date() - she.now) + 'ms\n'));
                }
                she.now = undefined;
            },

            // 当前时间
            getNow: function(){
                return new Date().toString().replace(/^(\w+\s\w+\s\d+\s\d+\s)(\d+\:\d+\:\d+)(.+)$/,'$2');
            }
        },///}
        /**
         * 帮助文本输出
         * @param  {Object} op 设置参数
         *                     - ustage   [string] 句柄名称
         *                     - commands [object] 操作方法列表 {key: val} 形式
         *                     - options  [object] 操作方法列表 {key: val} 形式
         * @return {Void}
         */
        help: function(op){///{
            if(!op){
                return;
            }
            var maxKeyLen = 0,
                myCommands = op.commands,
                myOptions = op.options,
                accountMaxKeyLen = function(arr){
                    var maxLen = 0;
                    for(var key in arr){
                        if(arr.hasOwnProperty(key)){
                            maxLen < key.length && (maxLen = key.length);
                        }
                    }
                    return maxLen;
                },
                textIndent = function(txt, num){
                    var r = '';
                    for(var i = 0, len = num; i < len; i++){
                        r += ' ';
                    }
                    return r + txt;
                },
                compose = function(key, arr){
                    var r = [],
                        maxkeyLen = accountMaxKeyLen(arr),
                        i, len;
                    
                    r.push('');
                    r.push(color.yellow(textIndent(key + ':', baseIndent)));
                    
                    for(var key in arr){
                        if(arr.hasOwnProperty(key)){
                            if(fn.type(arr[key]) == 'array'){
                                r.push( color.gray(textIndent(key, baseIndent * 2)) + textIndent(arr[key].shift(), maxkeyLen - key.length + 2));
                                for(i = 0, len = arr[key].length; i < len; i++){
                                    r.push(textIndent(arr[key][i], maxkeyLen + 2 + baseIndent * 2));
                                }



                            } else {
                                r.push(color.gray(textIndent(key, baseIndent * 2)) + textIndent(arr[key], maxkeyLen - key.length + 2));

                            }
                        }
                    }
                    
                    r.push('');
                    return r;
                },
                baseIndent = 2,
                r = [];
                
            op.usage && r.push(
                textIndent(color.yellow('Usage: ')+ (op.usage || '') +' <command>', baseIndent)
            );
            
            if(op.commands){
                r = r.concat(compose('Commands', op.commands));
            }
            
            if(op.options){
                r = r.concat(compose('Options', op.options));
            }
            
            r.push('');
            r.unshift('');
            
            console.log(r.join('\n'));
        },///}
        
        /**
         * 文本输出
         */
        msg: {///{
            /**
             * 错误输出
             * @param  {String} txt 文本内容
             * @return {Void}
             */
            error: function(txt){
                console.log(color.red('[error] ' + txt));
            },
            /**
             * 成功输出
             * @param  {String} txt 文本内容
             * @return {Void}
             */
            success: function(txt){
                console.log(color.cyan('[success] ' + txt));
            },
            /**
             * 一般输出
             * @param  {String} txt 文本内容
             * @return {Void}
             */
            notice: function(txt){
                console.log(color.yellow('[notice] ' + txt));
            },
            /**
             * 创造输出
             * @param {String} txt 文本内容
             */
            create: function(txt){
                console.log(color.green('[create] ' + txt));
            },
            /**
             * 输出分割线
             * @return {Object} msg
             */
            line: function(){
                console.log('\n' + color.gray('----------------------'));
                return this;
            },
            /**
             * 输出不换行的内容
             * @param  {String}  文本内容
             * @param  {Boolean} 是否换新的一行
             * @return {Void}
             */
            nowrap: function(txt, newLine){
                if(newLine){
                    process.stdout.write('\n');
                }
                process.stdout.write(txt);
                return this;
            }
        },///}
        
        /**
         * 拷贝文本
         * ------------
         * 单个文本方法
         * -------------
         * @param  {String}   path
         * @param  {String}   toPath
         * @param  {function} callback
         * @param  {RegExp}   filters
         * @param  {function} render
         *
         * --------------
         * 多个目录/文件方法
         * --------------
         * @param  {Object}   list
         * @param  {function} callback 回调方法
         * @param  {RegExp}   filters  忽略文件用 滤镜，选填参数
         * @param  {function} render   文本渲染用方法
         *                             - @param {String}  filename 文件名称
         *                             - @param {String}  content  文件内容
         *                             - @return {String} content  过滤后的文本内容
         * @return {Void}
         */
        copyFiles: function(list, callback, filters, render){///{
            // 传入参数初始化
            if(typeof arguments[0] == 'string' && typeof arguments[1] == 'string'){
                var flist = {};
                flist[arguments[0]] = arguments[1];
                list = flist;
                callback = arguments[2];
                filters = arguments[3];
                render = arguments[4];
            }
            
            if(typeof filters == 'function'){
                render = filters;
                filters = undefined;
            }

            !render && (
                render = function(filename, content){
                    return content;
                }
            );
            
            if(typeof list != 'object'){
                fn.msg.error('list 参数格式不正确');
                callback && callback(r);
                return;
            }
            var fileCopy = function(file, toFile, filters, render){
                    if(!fs.existsSync(file) || (filters && file.match(filters))){
                        return;
                    }
                    var content = fs.readFileSync(file);
                    fs.writeFileSync(toFile, render(file, content));
                    fn.timer.mark();
                },
                pathCopy = function(path, toPath, done, filters){
                    if(!fs.existsSync(path) || (filters && path.match(filters))){
                        done();
                    }
                    


                    fs.readdir(path, function(err, list){
                        var padding = list.length,
                            paddingCheck = function(){
                                if(!padding){
                                    return done();
                                }
                            };
                        if(!padding){
                            return done();
                        }
                        
                        list.forEach(function(item, index){
                            if(/^\./.test(item)){
                                if(!--padding){
                                    return done();
                                }
                            }

                            var myFile = path + item,
                                targetFile = toPath + item,
                                stat = fs.statSync(myFile);

                            if(filters && filters.test(myFile)){
                                if(!--padding){
                                    return done();
                                }
                            } else if(stat.isDirectory()){
                                if(!fs.existsSync(targetFile)){
                                    fs.mkdirSync(targetFile);
                                    fn.timer.mark();
                                }

                                pathCopy(myFile + '/', targetFile + '/',  function(){
                                    if(!--padding){
                                        return done();
                                    }
                                }, filters);
                            } else {
                                fileCopy(myFile, targetFile, filters, render);
                                if(!--padding){
                                    return done();
                                }
                            }
                        });

                        
                    });
                },
                paddingCheck = function(){
                    if(!padding){
                        callback && callback();
                    }
                },
                padding = 0,
                stat;
            for(var path in list){
                if(list.hasOwnProperty(path)){
                    stat = fs.statSync(path);
                    if(stat.isDirectory()){
                        padding++;
                        pathCopy(path + '/', list[path] + '/', function(){
                            padding--;
                            paddingCheck();

                        }, filters);
                    } else {
                        padding++;
                        fileCopy(path, list[path], filters, render);
                        padding--;
                        paddingCheck();
                    }
                }
            }
        },///}
        /**
         * 删除文本
         * ------------
         * 单个文本方法
         * -------------
         * @param  {String}   path
         * @param  {function} callback
         * @param  {RegExp}   filters
         *
         * --------------
         * 多个目录/文件方法
         * --------------
         * @param  {Array}    list
         * @param  {function} callback 回调方法
         * @param  {RegExp}   filters  忽略文件用 滤镜，选填参数
         *
         * @return {Void}
         */
        removeFiles: function(list, callback, filters){///{
            !fn.isArray(list) && (list = [list]);
            
            var rmFile = function(file, filters){
                    if(!fs.existsSync(file) || (filters && filters.test(file))){
                        return;
                    }
                    fs.unlinkSync(file);
                    fn.timer.mark();

                },
                rmPath = function(path, filters){
                    var list = fs.readdirSync(path);

                    list.forEach(function(item, i){
                        var file = path + item;
                       
                        if(filters && filters.test(file)){

                        } else {
                            var stat = fs.statSync(file);
                                
                            if(stat.isDirectory()){
                                rmPath(file + '/', filters);
                                fs.rmdirSync(file + '/');
                                fn.timer.mark();

                            } else {
                                rmFile(file);
                            }
                        }
                    });
                };

            list.forEach(function(item, index){
                if(!item){
                    return;
                }
                var stat = fs.statSync(item);
                if(stat.isDirectory()){
                    rmPath(item, filters);
                } else {
                    rmFile(item, filters);
                }
            });
            callback && callback();
        },///}

        /**
         * 路径格式化
         * @param  {String} path 需要格式化的路径文本
         * @return {String} 格式化后的路径文本
         */
        formatPath: function(path){
            if(path){
                // \a\b/c => a/b/c
                path = path.replace(/\\/g, '/');

                // a/./b/./c => a/b/c
                path = path.replace(/(\/(\.\/)+)/g,'/');
                
                // a///b//////c => a/b/c
                path = path.replace(/([^\:])\/+\//g, '$1/');

                // a/b/../c/d/e/../../f/ => a/c/f/
                var DOUBLE_DOT_REG = /[^\/]*(\/\.\.\/)/
                while(path.match(DOUBLE_DOT_REG)){
                    path = path.replace(DOUBLE_DOT_REG, '');
                }
            }
            return path;
        },

        /**
         * 判断是否数组
         * @param  {Anything}  需要判断的对象
         * @return {Boolean}  是否数组
         */
        isArray: function(arr){
            return /Array/.test(Object.prototype.toString.call(arr));
        },

        /**
         * 运行 cmd
         * @param  {String|Array} str           cmd执行语句 or 数组
         * @param  {funciton}     callback      回调函数
         *                        - json.status 状态码 1:成功, 0:失败
         *                        - json.error  错误信息
         * @return {Void}
         */
        runCMD: function(str, callback, path, showOutput){
            var myCmd = require('child_process').exec,
                r = {
                    status:0,
                    error:''
                },
                child;
            showOutput === undefined && (showOutput = true);
            if (!str) {
                r.error = '没任何 cmd 操作';
                return callback(r);
                
            }
            if (!/Array/.test(Object.prototype.toString.call(str))) {
                str = [str];
            }

            child = myCmd(str.join(" && "),{
                maxBuffer: 2000 * 1024,
                cwd: path || ''
            }, function(err, stdout, stderr){
                if(err){
                    // r.error = err.stack.replace(/(\r|\n|\t)+/g,';').replace(/\s+/g,' ').replace(/:[^;:]+;/g,':');
                    if(showOutput){
                        console.log('cmd运行 出错');
                        console.log(err.stack);
                    }
                    r.error = 'cmd运行 出错';
                    return callback(r);
                    
                } else {
                    r.status = 1;
                    return callback(r);
                }

            });
            child.stdout.setEncoding('utf8');
            
            if(showOutput){
                child.stdout.pipe(process.stdout);
                child.stderr.pipe(process.stderr);
            }
            
        },
        
        // 兼容存在严重问题， TODO
        runSpawn: function(cmdstr, callback, path){
            var mySpawn = require('child_process').spawn,
                cmdArr = cmdstr.split(/\s+/),
                cmdHandler = cmdArr.shift();
            
            if(pg.isWindows){
                cmdHandler = 'npm.cmd';
            }

            var ctrl = mySpawn(cmdHandler, cmdArr, {
                    cwd: path || undefined
                }),
                r = {
                    'status': 0

                };

            ctrl.stdout.setEncoding('utf8');
            ctrl.stdout.pipe(process.stdout);
            ctrl.stderr.pipe(process.stderr);
            
            ctrl.on('error', function(code){
                r.error = code;
            });

            ctrl.on('close', function(code){
                if(code != 0){
                    r.code = code;
                } else {
                    r.status = 1;
                }

                callback && callback(r);
            });
            
            // ctrl.on('exit', function(code){
                
            //     if(code != 0){
            //         r.code = code;
            //     } else {
            //         r.status = 1;
            //     }
            //     callback && callback(r);
            // });
        },

        
        
        /**
         * ajax异步
         * @param {string}   method    get|post|patch|delete|put
         * @param {string}   src       请求的地址
         * @param {object}   query     query object
         * @param {function} callback  回调函数
         * @param {string}   type      返回数据格式
         * @param {function} error     错误回调函数
         */
        ajax: function(){
            var option = {
                    method: '',
                    src: '',
                    callback: undefined,
                    obj: undefined,
                    type: '',
                    nolog: false,
                    error: undefined
                },
                now = new Date(),
                myArgv = arguments,
                argvPrase = function(){
                    var argvType = {
                            method: 'string',
                            src: 'string',
                            opt: 'object|string',
                            callback: 'function',
                            type: 'string',
                            nolog: 'boolean',
                            error: 'function',
                            option: 'object'
                        },
                        argvMatch = [];
                
                    switch(myArgv.length){///{
                        case 1:
                            argvMatch = [
                                ['option']
                            ];
                            break;

                        case 3:
                            argvMatch = [
                                ['method','src','callback'],
                                ['method','src', 'opt']
                            ];
                            break;

                        case 4:
                            argvMatch = [
                                ['method', 'src', 'opt', 'callback'],
                                ['method', 'src', 'callback', 'type'],
                                ['method', 'src', 'callback', 'nolog'],
                                ['method', 'src', 'callback', 'error']
                            ];
                            break;

                        case 5:
                            argvMatch = [
                                ['method', 'src', 'callback','type','nolog'],
                                ['method', 'src', 'callback','type','error'],
                                ['method', 'src', 'callback','nolog','error'],
                                ['method', 'src','opt','callback','nolog'],
                                ['method', 'src','opt','callback','type'],
                                ['method', 'src','opt','callback','error']
                            ];
                            break;

                        case 6:
                            argvMatch = [
                                ['method', 'src', 'callback','type','nolog', 'error'],
                                ['method', 'src', 'opt', 'callback','type','nolog'],
                                ['method', 'src', 'opt', 'callback','type', 'error'],
                                ['method', 'src', 'opt', 'callback','nolog', 'error']
                            ];
                            break;

                        case 7:
                            argvMatch = [
                                ['method', 'src', 'opt', 'callback','type','nolog', 'error']
                            ];
                            break;

                        default:
                            break;
                    }///}
                    argvMatch.forEach(function(arr, index){
                        var fargv, fattr,
                            i, fs, len;

                        for(i = 0, fs, len = arr.length; i < len; i++){
                            fargv = myArgv[i];
                            fattr = arr[i];
                            if(fattr == 'option' && new RegExp(argvType[fattr], 'g').test(typeof fargv)){
                                for(var key in fargv){
                                    if(fargv.hasOwnProperty(key)){
                                        option[key] = fargv[key];
                                    }
                                }
                                return;

                            } else {
                                if(!new RegExp(argvType[fattr], 'g').test(typeof fargv)){
                                    return;
                                }
                            }
                        }

                        //all is match
                        for(i = 0, len = arr.length; i < len; i++){
                            fargv = myArgv[i];
                            fattr = arr[i];
                            option[fattr] = fargv;
                        }
                    });
                };
            
            

            argvPrase();
            var src = option.src,
                method = option.method || 'get';

            if(option.obj){
                src += (!~src.indexOf('?')? '?': '&') + require('querystring').stringify(option.obj);
            }
            var uri = require('url').parse(src),
                data = uri.query || '',
                opt = {
                    method: method.toUpperCase(),
                    host: uri.hostname,
                    port: uri.port || 80,
                    path: uri.pathname +  (uri.search || ''),
                    // path:uri.path,
                    headers:{
                        "Content-Type": 'application/x-www-form-urlencoded',  
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
                        // "Content-Length": data.length  
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

                        switch(option.type){
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
                        option.callback && option.callback(r, result);
                        !option.nolog && fn.msg.notice('['+ method.toUpperCase() +'] ' + src + ' ' + color.green(new Date() - now + 'ms'));
                    });
                },
                myReq = uri.protocol == 'https'? https.request(opt, ajaxHandle) : http.request(opt, ajaxHandle);
                myReq.on('error', function(er){
                    fn.msg.error(er.message);
                    option.error && option.error(er);
                });
            // myReq.write(data);
            myReq.end();

        },
        /**
         * get异步
         * @param {string}   src       请求的地址
         * @param {object}   query     query object
         * @param {function} callback  回调函数
         * @param {string}   type      返回数据格式
         */
        get: function(){
            var myArgv = ['get'];
            for(var i = 0, len = arguments.length; i < len; i++){
                myArgv.push(arguments[i]);
            }
            this.ajax.apply(this, myArgv);
        },

        /**
         * post异步
         * @param {string}   src       请求的地址
         * @param {object}   query     query object
         * @param {function} callback  回调函数
         * @param {string}   type      返回数据格式
         */
        post: function(){
            var myArgv = ['post'];
            for(var i = 0, len = arguments.length; i < len; i++){
                myArgv.push(arguments[i]);
            }
            this.ajax.apply(this, myArgv);
        },
        /**
         * 获取文件目录结构 (.xx 会自动过滤)
         * @param  {String}   location 需要获取的物理路径
         * @param  {Funciton} callback 获取成功回调函数
         *                             - arguments[0] error [string] 错误码
         *                             - arguments[1] files [array]  文件列表
         * @return {Void}
         */
        getPaths: function(location, callback){
            var r = [],
                filter = new RegExp('^' + location, 'g'),
                readFiles = function(dir, done){
                    if(/\/$/.test(dir)){
                        dir = dir.replace(/\/$/,'');
                    }
                    fs.readdir(dir, function(err, list){
                        if(err){
                            console.log('err', err)
                            return done(err);
                        }

                        var total = list.length;

                        if(total <= 0){
                            return done(null, r);
                        }

                        list.forEach(function(file){
                            var myFile = dir + '/' + file;
                            fs.stat(myFile, function(err, stat){
                                // 过滤隐藏文件
                                if(/^\./.test(file)){
                                    !--total && done(null, r);
                                    
                                } else {
                                    if(stat && stat.isDirectory()){
                                        readFiles(myFile, function(res){
                                            !--total && done(null, r);
                                        });
                                        
                                    } else {
                                        r.push(myFile.replace(filter, ''));
                                        !--total && done(null, r);
                                        
                                    }
                                }
                                
                            });
                        });
                        

                    });

                    return r;
                };
            
            readFiles(location, function(error, files){
                files && files.sort(function(elm1,elm2){
                    return String(elm1).localeCompare(String(elm2));
                });
                callback(error, files);
            });


            
        },
        /**
         * 将文件列表转化成数据结构形式：
         * [
         *      {
         *          name: 'path01',
         *          src: undefined,
         *          items:[
         *              {
         *                  name: 'a.html',
         *                  src: 'path01/a.html',
         *                  items: undefined
         *              }
         *          ]
         *      }
         * ]
         * @param  {Array}  list   文件列表
         * @param  {String} prefix 生成目录的文件前缀
         * @return {Array}  r      格式化后的数据
         */
        pathsFormat: function(list, prefix){
            var prefix = prefix || '',
                pathObj = {},
                dataBuild = function(obj){
                    var r = [];    
                    for(var key in obj){
                        if(obj.hasOwnProperty(key)){
                            if(typeof obj[key] == 'object'){
                                r.push({
                                    name: key,
                                    items: dataBuild(obj[key])
                                });
                            } else {
                                r.push({
                                    name: key,
                                    href: obj[key]
                                });
                            }
                        }
                    }
                    return r;
                };

            list.forEach(function(pathstr, i){
                var arr = pathstr.split('/'),
                    myObj = pathObj;
                arr.forEach(function(path, i){
                    if(i != arr.length - 1){
                        !myObj[path] && (myObj[path] = {});
                        myObj = myObj[path];

                    } else {
                        myObj[path] = prefix + pathstr;
                    }
                });
                
            });

            return dataBuild(pathObj);
        },
        /**
         * promise 模块
         */
        Promise: function(fn){
            var she = this;
            
            she.queue = [];
            she.current = 0;
            she.then = function(fn){
                typeof fn == 'function' && she.queue.push(fn);
                return she;
            };
            she.start = function(){
                var myArgv = Array.prototype.slice.call(arguments);
                she.resolve.apply(she, myArgv);
            };

            she.resolve = function(){
                var myArgv = Array.prototype.slice.call(arguments);
                
                myArgv.push(she.resolve);
                if(she.current){
                    myArgv.push(she.queue[she.current - 1]);
                }

                if(she.current != she.queue.length){
                    she.queue[she.current++].apply(she, myArgv);
                }
            };
            if(fn){
                she.then(fn);
            }

            
        },
        /**
         * 字符串转 utf8编码
         * @param {string}  文本
         * @return {string} 转化后文本
         */
        utf8Encode: function(str){
            if(typeof str != 'string'){
                return str;
            }
            return str.replace(/[\u4E00-\u9FA5]/g, function($1){ return "\\u" + ("00"+$1.charCodeAt().toString(16)).slice(-4);});
        },
        
        /**
         * 判断对象类别
         * @param {Anything} 对象
         * @return {string}  类型
         */
        type: function (obj) {
            var type,
                toString = Object.prototype.toString;
            if (obj == null) {
                type = String(obj);
            } else {
                type = toString.call(obj).toLowerCase();
                type = type.substring(8, type.length - 1);
            }
            return type;
        },

        isPlainObject: function (obj) {
            var she = this,
                key,
                hasOwn = Object.prototype.hasOwnProperty;

            if (!obj || she.type(obj) !== 'object') {
                return false;
            }

            if (obj.constructor &&
                !hasOwn.call(obj, 'constructor') &&
                !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
                return false;
            }

            for (key in obj) {}
            return key === undefined || hasOwn.call(obj, key);
        },

        /**
         * 扩展方法(来自 jQuery)
         * extend([deep,] target, obj1 [, objN])
         * @base she.isPlainObject
         */
        extend: function () {
            var she = this,
                options, name, src, copy, copyIsArray, clone,
                target = arguments[0] || {},
                i = 1,
                length = arguments.length,
                deep = false;

            // Handle a deep copy situation
            if (typeof target === 'boolean') {
                deep = target;
                target = arguments[1] || {};
                // skip the boolean and the target
                i = 2;
            }

            // Handle case when target is a string or something (possible in deep copy)
            if (typeof target !== 'object' && she.type(target) !== 'function') {
                target = {};
            }

            // extend caller itself if only one argument is passed
            if (length === i) {
                target = this;
                --i;
            }

            for (; i<length; i++) {
                // Only deal with non-null/undefined values
                if ((options = arguments[i]) != null) {
                    // Extend the base object
                    for (name in options) {
                        src = target[name];
                        copy = options[name];

                        // Prevent never-ending loop
                        if (target === copy) {
                            continue;
                        }

                        // Recurse if we're merging plain objects or arrays
                        if (deep && copy && (she.isPlainObject(copy) || (copyIsArray = she.type(copy) === 'array'))) {
                            if (copyIsArray) {
                                copyIsArray = false;
                                clone = src && she.type(src) === 'array' ? src : [];
                            } else {
                                clone = src && she.isPlainObject(src) ? src : {};
                            }

                            // Never move original objects, clone them
                            target[name] = she.extend(deep, clone, copy);

                        // Don't bring in undefined values
                        } else if (copy !== undefined) {
                            target[name] = copy;
                        }
                    }
                }
            }

            // Return the modified object
            return target;
        }


    };
    

module.exports = fn;



