var express = require('express'),
	http = require('http'),
	path = require('path'),
	ejs = require('ejs'),
	routes = require('./application/routes/init'),
	config = require('./application/config/config'),
	MemStore = express.session.MemoryStore,
	domain = require('domain'),
	app = express(),
	server;

app.configure(function() {
	app.set('port', process.env.PORT || config.port);

	app.set('views', path.join(__dirname, 'tpl'));
	app.set('view engine', 'html');
	app.engine('.html', ejs.__express);

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

	


	
	// uncaughtException 避免程序崩溃
	// process.on('uncaughtException', function (err) {
	//     console.log(err);

	//     try {
	//         var killTimer = setTimeout(function () {
	//             process.exit(1);
	//         }, 30000);
	//         killTimer.unref();

	//         server.close();
	//     } catch (e) {
	//         console.log('error when exit', e.stack);
	//     }
	// });


	app.use(express.static(path.join(__dirname, 'static')));
	// app.use('/download', express.static(path.join(__dirname, 'download')));
});

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}


// 运行 rotes.js 读取 访问规则
routes(app);

server = http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});
