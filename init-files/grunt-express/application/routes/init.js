var main = require('./main'),
	api = require('./api'),
	global = require('../libs/global'),
	config = require('../config/config');

module.exports = function (app) {
	// main
	app.get('/', main.home);
		
	// interface
	app.get('/api/test', api.test);
	

	// 404
	app.get('*', main.nofound);
	
};
