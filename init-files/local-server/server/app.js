var express = require('express'),
	http = require('http'),
	path = require('path'),
	domain = require('domain'),
	swig = require('swig'),
	MemStore = express.session.MemoryStore,
	// ejs = require('ejs'),
	fn = require('./libs/global.js'),
	config = require('./config.js'),
	app = express(),
	server;

app.configure(function() {
	app.set('port', process.env.PORT || config.port);
	app.set('views', path.join(__dirname, 'server/components'));

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
	    console.log(err);
	});	


	app.use(express.static(path.join(__dirname, 'static')));
    
	// app.use('/download', express.static(path.join(__dirname, 'download')));
    // 运行 rotes.js 读取 访问规则
});

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

// 路由、自启动执行
new fn.Promise(function(next){ // 获取 components 里面所有文件
    fn.getPaths('./components', function(files){
        next(files);
    });

}).then(function(files, next){ // 筛选出 autorun.js router.js
    var 
        AUTORUN_REG = /[\/\\]?autorun\.js$/,
        ROUTER_REG = /[\/\\]?router\.js$/,
        autoruns = [],
        routers = [];

    console.log(files);

    files.forEach(function(file){
        if(AUTORUN_REG.match(file)){
            autoruns.push(file);

        } else if(ROUTER_REG.match(file)){
            routers.push(file);
        }

    });
    next(autoruns, routers);

}).then(function(autoruns, routers, next){// 分别执行
        
    routers.forEach(function(item){
        var iRouter = require(item);
        iRouter(app);
    });

    var padding = autorunArr.length;

    autoruns.forEach(function(item){
        var iAutoRun = require(item);
        iAutoRun(app, function(){
            if(!--padding){
                next();
            }
        });
    });

}).then(function(){ // 启动服务
    server = http.createServer(app).listen(app.get('port'), function() {
        console.log('Express server listening on port ' + app.get('port'));
    });

}).start();
