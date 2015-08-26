var main = require('./main'),
    fs = require('fs'),
	api = require('./api'),
	global = require('../libs/global'),
	config = require('../config/config');

module.exports = function (app) {
	// main
	app.get('/', main.home);
	app.get('/map', main.map);
		
	// interface
	app.get('/api/test', api.test);

    app.get('/api/livereload', api.livereload);
	
    app.get('/livereload.js', function(req, res){
        // res.set({
        //     'Content-Type': 'application/x-javascript; charset=utf-8'
        // });
        res.send(fs.readFileSync(__dirname + '/../livereload/ll.client.js'));
    });

	// 404
	app.get('*', main.nofound);
	
};
