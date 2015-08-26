var global = require('../libs/global'),
	config = require('../config/config');


module.exports = {
	// 根目录
	home: function(req, res){
        if(req.host != config.serverAdress && config.serverAddress != '127.0.0.1'){
            res.redirect('http://' + config.serverAdress + ':'+ config.port +'/');
            return;
        }
		// 地址重定向
		// res.redirect('/mod/html/demo/index.html');
        res.render('main/home', {"config": config});
	},

    map: function(req, res){
        if(req.host != config.serverAdress && config.serverAddress != '127.0.0.1'){
            res.redirect('http://' + config.serverAdress + ':'+ config.port +'/map');
            return;
        }
		// 地址重定向
		// res.redirect('/mod/html/demo/index.html');
        res.render('main/home', {"config": config});
    },

	// 404
	nofound: function(req, res){
		res.status(404).render('common/404', {status: 404, title: '页面不存在'});
	} 
};
