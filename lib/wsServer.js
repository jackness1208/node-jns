var fs = require('fs'),
    fn = require('./global'),
    config = require('./config');
var wsServer = {
        enable: false,
        server: undefined,
        io: undefined,
        socket: undefined,
        port: config.webSocket.port,

        scripts: [
            '/socket.io/socket.io.js',
            '/livereload.js'
        ],

        proxyAPI: '/proxy',

        init: function(){
            var she = this;
            she.server = require('http').createServer(function(req, res){
                var myUri = require('url').parse(req.url);
                if(myUri.pathname == '/livereload.js'){ // liveload.js 文件

                    res.writeHead(200, { 
                        'Content-Type': 'application/x-javascript'
                    });
                    res.write(fs.readFileSync(config.basePath + 'lib/livereload.js'));
                    res.end();
                

                } else if(/^\/socket.io/g.test(myUri.pathname)){ // socket.io 转发
                    fn.get('http://'+ config.serverAdress +':'+ config.webSocket.port + myUri.pathname + (myUri.query || ''), function(buffer, result){
                        res.writeHead(200, result.headers);
                        res.write(buffer);
                        res.end();
                    }, 'buffer');

                } else if(/^http[s]?:\/\//.test(req.url)){ // 代理接口 - 修改 header 方式实现（not work）
                    
                    var proxyUrl = req.url;

                    if(/^http[s]?:\/\//.test(proxyUrl)){
                        fn.get(proxyUrl, '', function(content, result){
                            
                            // res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
                            // res.setHeader('Access-Control-Allow-Credentials', true);
                            // res.setHeader('Access-Control-Allow-Origin', 'http://' + config.serverAdress +':'+ config.webSocket.port + '/*');
                            // res.setHeader('Access-Control-Allow-headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
                            // for(var key in result.headers){
                            //     if(result.headers.hasOwnProperty(key)){
                            //         if(key != 'access-control-allow-origin'){
                            //             res.setHeader(key, result.headers[key]);
                            //         }
                            //     }
                            // }
                            res.writeHead(200, result.headers);
                            // res.writeHead(200, result.headers);
                            
                            if(~result.headers['content-type'].indexOf('html')){
                                res.write(wsServer.render(proxyUrl, String(content)));
                                // res.write(content);
                            } else {
                                res.write(content);
                            }
                            res.end();
                        },'buffer', true, function(er){
                            res.writeHead(200, {
                                'Content-Type': 'text/html',
                            });
                            res.write(proxyUrl + ' 代理失败:' + er.message);
                            res.end();
                        });

                    } else {
                        res.writeHead(200, {
                            'Content-Type': 'text/html',
                        });
                        res.write(proxyUrl + ' 代理失败，地址格式不正确');
                        res.end();
                    }
                // } else if(String(req.url).replace(/\?.*$/g, '') == wsServer.proxyAPI){ // 代理接口
                //     res.writeHead(200, {
                //         'Content-Type': 'text/html'
                //     });
                //     var proxyUrl = req.url.replace(new RegExp('^.*' + wsServer.proxyAPI + '[?]', 'g'),'');

                //     if(/^http[s]?:\/\//.test(proxyUrl)){
                //         fn.get(proxyUrl, '', function(content){
                //             res.write(wsServer.render(proxyUrl, content));
                //             res.end();
                //         }, function(er){
                //             res.write(proxyUrl + ' 代理失败:' + er.message);
                //             res.end();
                //         });

                //     } else {
                //         res.write(proxyUrl + ' 代理失败，地址格式不正确');
                //         res.end();
                //     }

                } else { // 404
                    res.writeHead(404, {
                        'Content-Type': 'text/html'
                    });
                    res.end();
                }
                
                
            });
            she.io = require('socket.io')(she.server);
            she.server.listen(she.port);
            she.io.on('connection', function(socket){
                she.socket = socket;
            });
            // she.scripts.forEach(function(src){
            //     fn.msg.notice(src);
            // });
            fn.msg.success('websocket server start');
            fn.msg.notice('代理地址：');
            fn.msg.notice('http://'+ config.serverAdress +':'+ config.webSocket.port);
            she.enable = true;
        },
        send: function(event, txt){
            var she = this;
            if(!she.socket){
                return;
            }
            she.socket.emit(event, txt);
        },
        render: function(file, content){
            var she = this,
                fileExt = file.split('.').pop(),
                r = '';
            
            if(/^http[s]?:\/\//.test(file) && /\<\/?html\>/.test(content)){
                she.scripts.forEach(function(src){
                    r += '\n<script src="'+ src +'"></script>';
                });
                content = content.replace(/\<head\>/, '<head>' + r);
            } else {
                switch(fileExt){
                    case 'html':
                        she.scripts.forEach(function(src){
                        r += '\n<script src="http://'+ config.serverAdress + ':' + config.webSocket.port +  src +'"></script>';
                        });
                        content = content.replace(/\<head\>/, '<head>' + r);
                        break;

                    default:
                        
                        break;
                }
            }

            
            
            return content;
        }
    };

module.exports = wsServer;
