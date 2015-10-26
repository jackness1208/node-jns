var config = require('../config/config'),
	fs = require('fs');

module.exports = {

	/**
	 * 运行 cmd
	 * @param  {String|Array} str           cmd执行语句 or 数组
	 * @param  {funciton}     callback      回调函数
	 *                        - json.status 状态码 1:成功, 0:失败
	 *                        - json.error  错误信息
	 * @return {Void}
	 */
	runCMD: function(str, callback){
		var myCmd = require('child_process').exec,
			r = {
				status:0,
				error:''
			},
			child;
		if (!str) {
			r.error = '没任何 cmd 操作';
			return callback(r);
			
		}
		if (!/Array/.test(Object.prototype.toString.call(str))) {
			str = [str];
		}

		child = myCmd(str.join(" && "),{
			maxBuffer: 2000 * 1024
		}, function(err, stdout, stderr){
			if(err){
				// r.error = err.stack.replace(/(\r|\n|\t)+/g,';').replace(/\s+/g,' ').replace(/:[^;:]+;/g,':');
				console.log('cmd运行 出错');
				console.log(err.stack);
				r.error = 'cmd运行 出错';
				return callback(r);
				
			} else {
				r.status = 1;
				return callback(r);
			}

		});
		child.stdout.setEncoding('utf8');
	},


	

	/**
	 * 日期格式化
	 * @param  {Date|String} date 日期字符串
	 * @return {string} 日期
	 */
	dateFormat: function(date){
		var myDate = new Date(date);
		if(myDate.getDate()){
			return myDate.getFullYear() + '-' + (myDate.getMonth() + 1 < 10 ? '0' + (myDate.getMonth() + 1): (myDate.getMonth() + 1) ) + '-' + (myDate.getDate() < 10? '0' + myDate.getDate(): myDate.getDate());
		} else {
			return '';
		}
	},

	/**
	 * 获取文件目录结构 (.xx 会自动过滤)
	 * @param  {String}   location 需要获取的物理路径
	 * @param  {Funciton} callback 获取成功回调函数
	 *                             - arguments[0] error [string] 错误码
	 *                             - arguments[1] files [array]  文件列表
	 * @return {Void}
	 */
	getPaths: function(location, callback){
		var r = [],
			filter = new RegExp('^' + location, 'g'),
			readFiles = function(dir, done){
				if(/\/$/.test(dir)){
					dir = dir.replace(/\/$/,'');
				}
				fs.readdir(dir, function(err, list){
					if(err){
						return done(err);
					}

					var total = list.length;

					if(total <= 0){
						return done(null, r);
					}

					list.forEach(function(file){
						var myFile = dir + '/' + file;
						fs.stat(myFile, function(err, stat){
							// 过滤隐藏文件
							if(/^\./.test(file)){
								!--total && done(null, r);
								
							} else {
								if(stat && stat.isDirectory()){
									readFiles(myFile, function(res){
										!--total && done(null, r);
									});
									
								} else {
									r.push(myFile.replace(filter, ''));
									!--total && done(null, r);
									
								}
							}
							
						});
					});
					

				});

				return r;
			};
		
		readFiles(location, function(error, files){
			files.sort(function(elm1,elm2){
				return String(elm1).localeCompare(String(elm2));
			});
			callback(error, files);
		});


		
	},

	/**
	 * 判断对象是否数组
	 * @param  {anything} obj 需要判断的对象
	 * @return {boolean}
	 */
	isArray: function(obj){
		return /Array/.test(Object.prototype.toString.call(obj));
	},

};
