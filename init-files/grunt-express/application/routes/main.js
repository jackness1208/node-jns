var global = require('../libs/global'),
	config = require('../config/config');

module.exports = {
	// 根目录
	home: function(req, res){
		// 地址重定向
		// res.redirect('/mod/html/demo/index.html');
        res.render('main/home', {"config": config});
	},

	// 404
	nofound: function(req, res){
		res.render('common/404', {status: 404, title: '页面不存在'});
	} 
};
