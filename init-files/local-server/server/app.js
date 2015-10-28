var express = require('express'),
	http = require('http'),
	path = require('path'),
	domain = require('domain'),
	swig = require('swig'),
	MemStore = express.session.MemoryStore,
	// ejs = require('ejs'),
	fn = require('./libs/global.js'),
	config = require('./config.js'),
    serverPath = path.join(__dirname, '../'),
	app = express(),
	server;

app.configure(function() {
	app.set('port', process.env.PORT || config.port);
	app.set('views', path.join(serverPath, 'server/components'));

    app.engine('tpl', swig.renderFile);
    app.set('view engine', 'tpl');
	
    // app.engine('.tpl', ejs.__express);
	// app.set('view engine', 'tpl');

	// icon
	app.use(express.favicon( config.favicon));

	// log
	app.use(express.logger('dev'));

	app.use(express.compress());
	app.use(express.urlencoded());
	app.use(express.methodOverride());

	app.use(express.cookieParser());
	app.use(express.session({
		secret: config.session.secret,
		store: MemStore({
			reapInterval: config.session.reapInterval
		})
	}));


    process.on('uncaughtException', function (err) {
        console.error('Uncaught exception:\n', err.stack);
    });


	app.use(express.static(path.join(serverPath, 'static')));
	app.use('/components', express.static(path.join(serverPath, 'views/components')));
    
	// app.use('/download', express.static(path.join(serverPath, 'download')));
    // 运行 rotes.js 读取 访问规则
});

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

// 路由、自启动执行
new fn.Promise(function(next){ // 获取 components 里面所有文件
    var iPath = './components';
    fn.getPaths(iPath, function(err, files){
        var r = [];
        if(err){
            console.log(err);
            return;
        }

        files.forEach(function(file){
            r.push(iPath + file);
        });

        next(r);
    });

}).then(function(files, next){ // 筛选出 autorun.js router.js
    var 
        AUTORUN_REG = /[\/\\]?autorun\.js$/,
        ROUTER_REG = /[\/\\]?router\.js$/,
        autoruns = [],
        routers = [];

    files.forEach(function(file){
        if(file.match(AUTORUN_REG)){
            autoruns.push(file);

        } else if(file.match(ROUTER_REG)){
            routers.push(file);
        }

    });
    next(autoruns, routers);

}).then(function(autoruns, routers, next){// 分别执行
        
    routers.forEach(function(item){
        var iRouter = require(item);
        iRouter(app);
    });

    var padding = autoruns.length;

    autoruns.forEach(function(item){
        var iAutoRun = require(item);
        iAutoRun(app, function(){
            if(!--padding){
                next();
            }
        });
    });

}).then(function(next){// 设置主页、 404

    // main
	app.get('/', function(req, res){
        if(req.host != config.serverAdress && config.serverAddress != '127.0.0.1'){
            res.redirect('http://' + config.serverAdress + ':'+ config.port +'/');
            return;
        }
		// 地址重定向
        res.redirect('/map');
    });

    // 404
    app.use(function(req, res, next){
        res.status(404);

        // respond with html page
        if (req.accepts('html')) {
        res.status(404).render('common/404', { url: req.url });
        return;
        }

        // respond with json
        if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
        }

        // default to plain-text. send()
        res.type('txt').send('Not found');
    });

    next();

}).then(function(){ // 启动服务
    server = http.createServer(app).listen(app.get('port'), function() {
        fn.msg.success('Express server listening on port ' + app.get('port'));
    });

}).start();
