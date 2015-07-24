var http = require('http'),
	fs = require('fs');

// 防止 TCP.onread
process.on('uncaughtException', function (err) {
	//打印出错误
	console.log(err);
	//打印出错误的调用栈方便调试
	console.log(err.stack);
	return true;
});

var fn = {
	clone: function(obj){
		if(typeof(obj) != 'object' || obj === null){
			return obj;
		}
		
		var r = Array.prototype.splice === obj.splice?[]:{};
		for(var i in obj){
			if(obj.hasOwnProperty(i)){
				r[i] = fn.clone(obj[i]);

			}
		}
		
		return r;
	},

	makeFunction: function(str,type){
		if(/function|object/.test(typeof str) || (type != "function" && type != "object" && type != "reg" && typeof str == "string")){
			return function(){ return str;}();
		
		} else {
			var fn;
			try{
				fn = new Function("try{return "+ str +"} catch(er){return undefined}");
			} catch(er){
				fn = function(){};
			}
			return type == "function"? fn:fn();
		}
	},

	attrAssignment: function(o1,o2){
		if(!o1){
			return {};
		}
		o2 = o2 || {};

		var r = fn.clone(o1) || {},
			fAttr,
			myAttr;

		for(var key in r){
			if(r.hasOwnProperty(key)){
				myAttr = o2[key];

				if( typeof myAttr == "undefined" || myAttr === ""){
					continue;
				}
				switch(typeof r[key]){
					case "number":
						!isNaN(myAttr) && (r[key] = Number(myAttr) );
						break;

					case "string":
						r[key] = myAttr;
						break;

					case "function":
						r[key] = fn.makeFunction(myAttr,"function") || r[key];
						break;

					case "object":
						if(r[key].splice === Array.prototype.splice || JSON.stringify(r[key]) == "{}"){
							r[key] = fn.makeFunction(myAttr,"object");
						} else {
							r[key] = fn.attrAssignment(r[key],fn.makeFunction(myAttr,"object"));
						}
						
						break;

					case "boolean":
						typeof myAttr == "boolean" && (r[key] = myAttr);
						typeof myAttr == "string" && (r[key] = myAttr == "true"?true:false); 
						break;

					case "undefined":
						r[key] = fn.makeFunction(myAttr);
						break;

					default:
						break;
				}
			}
		}

		return fn.clone(r);
	},

	isArray: function(arr){
		return /Array/.test(Object.prototype.toString.call(arr));
	},

	isNaNFn: function(fn){
		if(typeof fn == "function"){
			return fn.toString().replace(" ","") === "function(){}";
		} else {
			return true;
		}
	},

	get: function(url){
		var myfn, 
			myQuery,
			myProxy;

		if(typeof arguments[1] == 'function'){
			myfn = arguments[1];
			myProxy = arguments[2];
			myQuery = {};
		} else if(typeof arguments[1] == 'object'){
			myQuery = arguments[1];
			myfn = arguments[2];
			myProxy = arguments[3];
		}
		var queryData = require('querystring').stringify(myQuery),
			urlAcc = require('url').parse(url),
			opt = {
                host: urlAcc.hostname,
                port: urlAcc.port || 80,
                path: urlAcc.pathname +  urlAcc.search,
				method:'GET',
				headers:{
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
					"Content-Type": 'application/x-www-form-urlencoded',  
					"Content-Length": queryData.length 
                }
            };

		if(myProxy && myProxy.port && myProxy.host){
			opt.host = myProxy.host;
			opt.port = myProxy.port;
			opt.path = url;

		} else {
			opt.host = urlAcc.host;
			opt.port = urlAcc.port;
			opt.path = urlAcc.path;
			
		}
		var myReq = http.request(opt, function(result){
			var chunks = [],
				size = 0;

			result.on('data', function(chunk){
				size += chunk.length;
				chunks.push(chunk);
			});

			result.on('end', function(){
				var myBuffer = Buffer.concat(chunks, size);

				myfn && myfn(myBuffer);
			});
		});
		myReq.write('');
		myReq.end();
	}
};

module.exports = {

	option: {
		// url请求并发数
		threads: 20,

		// 原始数据
		originData: undefined,


		/**
		 * 请求的url集合 Array | function
		 * 若为 Array 则表示 需要请求的 url集合
		 * 若为 function 则按照以下参数
		 * @param {object} data 循环 option.originData 时的 object 对象
		 * @param {string} url  返回 需要请求的url
		 */
		urls: undefined,

		// 抓取结束后判断是否继续抓取
		onNext: function(){
			return true;
		},

		/**
		 * 页面抓取操作
		 * @param  {buffer} 抓取后返回的二进制数据
		 * @return {object|Array} 抓取后的数据对象, 如果是 Array 则会无视 originData 不对已有数据进行合并操作（因为已经不是1对1了）
		 */
		onCrawl: function(){

		},
		// 若 option.urls 为 undefined 时， 会执行此属性下的 操作, 目的是给与 option.urls 赋值
		initTotal: {
			// 获取 总数的 抓取地址
			url: '',
			/**
			 * 爬虫操作
			 * @param  {buffer} 抓取后返回的二进制数据
			 * @return {array} 会自动赋值到 option.urls 上面作为循环依据
			 */
			onCrawl: function(){

			}
		},
		// 爬虫结束回调函数
		callback: function(){

		},

		// 代理服务设置
		proxy: {
			host:'',
			port:0
		}
	},
	
	// 初始化
	init: function(op){
		var she = this;
		she.option = fn.attrAssignment(she.option, op);

		if(she.option.urls){
			if(fn.isArray(she.option.urls)){
				she._threadInit();

			} else if(typeof she.option.urls == 'function' && fn.isArray(she.originData)){
				she._threadInit();

			} else {
				console.log('option.url 格式不对');
			}
		} else {
			// 获取 urls 字段
			if(she.option.initTotal.url && !fn.isNaNFn(she.option.initTotal.onCrawl)){
				fn.get(she.option.initTotal.url, function(buffer){
					she.option.urls = she.option.initTotal.onCrawl(buffer);

					if(fn.isArray(she.option.urls)){
						console.log('init total is done, now urls count:' + she.option.urls.length);
						she._threadInit();
					} else {
						console.log('option.initTotal.onCrawl 返回格式不正确');
					}
				}, op.proxy);
			}
		}
	},

	_fragPath: __dirname + '/__source',
	// 删除临时文件
	_removeFrag: function(){
		var she = this,
			deleteHandle = function(path){
				var files = fs.readdirSync(path);
				files.forEach(function(file){
					var curPath = path + '/' + file;
					if(fs.statSync(curPath).isDirectory()){
						deleteHandle(curPath);
					} else {
						fs.unlinkSync(curPath);
					}
				});
				fs.rmdirSync(path);
			};

		deleteHandle(she._fragPath);
		console.log('delete done');
	},
	_threadInit: function(){
		var she = this,
			op = she.option;
		if(typeof op.threads != 'number'){
			console.log('option.threads 格式不正确');
			return;
		}

		var threadNum = op.threads,
			lineCount = op.threads,
			threadCheck = function(){
				lineCount--;

				if(!lineCount){
					var resultData = [];
					for(var i = 0, fd, len = threadNum; i < len; i++){
						fd = JSON.parse(fs.readFileSync(she._fragPath + '/reptileitdata_' + i + '.txt'));
						fd && (resultData = resultData.concat(fd));
					}

					she._removeFrag();
					op.callback && op.callback(resultData);
				}
			};

		if(!fs.existsSync(she._fragPath)){
			fs.mkdirSync(she._fragPath);
		}


		if((typeof op.urls == 'function' && fn.isArray(op.originData)) || fn.isArray(op.urls)){
			for(var i = 0; i < threadNum; i++){
				she._threadHandle(i, threadCheck);
			}
		
		} else {
			console.log('option.urls 格式不正确');
		}
		
	},

	_threadHandle: function(index, callback){
		var she = this,
			op = she.option,
			dataTotal = op.originData? op.originData.length: op.urls.length,
			myTotal = Math.ceil(dataTotal / op.threads),
			startIndex = index * myTotal,
			endIndex = (index + 1) * myTotal - 1,
			curIndex = startIndex,

			resultData = [],

			callbackHandle = function(resultData){
				var fileName = 'reptileitdata_' + index + '.txt';
					fileUrl = she._fragPath + '/' + fileName,
					

				fs.writeFile(fileUrl, JSON.stringify(resultData), function(er){
					if(er){
						console.log(fileName + ' save fail x:' + er.message);
					} else {
						console.log(fileUrl + ' save ok √');
						callback(resultData);
					}
				})
			},

			getHandle = function(url, data, done){
				var resultData = data || {},
					fd;
                if(!url){
                    done();
                    return;
                }

				fn.get(url, function(buffer){
					console.log(url + ' loaded √');
					fd = op.onCrawl(buffer);

					if(fd){
						if(fn.isArray(fd)){
							resultData = fd;
							done(resultData);

						} else if(typeof fd == 'object'){
							for(var key in fd){
								if(fd.hasOwnProperty(key)){
									fd[key] && (resultData[key] = fd[key]);
								}
							}
							done(resultData);
						} else {
							done();
						}

						
					} else {
						done();
					}
					
				}, op.proxy);
			},

			nextHandle = function(data){

				if(data){
					if(fn.isArray(data)){
						resultData = resultData.concat(data);
					} else{
						resultData.push(data);
					}
				}

				curIndex++;

				if(op.onNext(data)){
					if(curIndex <= endIndex && curIndex < dataTotal){
						if(typeof op.urls == 'function'){
							getHandle(op.urls(op.originData[curIndex]), originData[curIndex], nextHandle);
							
						} else {
							getHandle(op.urls[curIndex], undefined, nextHandle);
							
						}
					} else {
						callbackHandle(resultData);
					}

				} else {
					callbackHandle(resultData);
				}
				

				
			};

		

		if(typeof op.urls == 'function'){
			getHandle(op.urls(op.originData[curIndex]), originData[curIndex], nextHandle);
			
		} else {
			getHandle(op.urls[curIndex], undefined, nextHandle);
			
		}
			
	}
};

