var 
	config = require('../config/config');

module.exports = function (app) {

	// main
	app.get('/map', function(req, res){
        if(req.host != config.serverAdress && config.serverAddress != '127.0.0.1'){
            res.redirect('http://' + config.serverAdress + ':'+ config.port +'/');
            return;
        }
		// 地址重定向
        res.render('sitemap/sitemap', {"config": config});
    });


	// 404
    app.get('*', function(req, res){
        res.status(404).render('common/404', {status: 404, title: '页面不存在'});
    });

};

