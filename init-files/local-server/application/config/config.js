var os = require('os');

module.exports = {
	// 站点目录
	sitePath: __dirname.replace(/\\/g,'/') + '/../../',
	// 站点端口
	port: 5000,
	// 站点 ico
	favicon: __dirname.replace(/\\/g,'/') + '/../../static/images/favicon.ico',

	// 站点主域
	domain:'/',

	// 时间戳
	cssjsdate: '201502261750',

	// session
	session:{
		secret: 'helloJns',
		reapInterval: 60000 * 10
	},

	// cookies
	cookies:{
		timeout: 2 * 24 * 60 * 60 * 1000
	},

	// database
	db: {
	    host     : 'localhost',
	    user     : 'root',
	    password : '123456',
	    database : 'admin',
	    connectionLimit: 50
	},
    serverAdress: (function(){
        var ipObj = os.networkInterfaces(),
            ipArr;
        for(var key in ipObj){
            if(ipObj.hasOwnProperty(key)){
                ipArr = ipObj[key];
                for(var fip, i = 0, len = ipArr.length; i < len; i++){
                    fip = ipArr[i];
                    if(fip.family.toLowerCase() == 'ipv4' && !fip.internal){
                        return fip.address;
                    }
                }
            }
        }
        
        return '127.0.0.1';
    })()
};
