String.prototype.trim = function(){return this.replace(/^(\s|\u3000)*|(\s|\u3000)*$/g,"");};

String.prototype.getBytes = function(){var bytes=0;for(var i=0;i<this.length;i++){if(this.charCodeAt(i)>256){bytes+=2;}else{bytes+=1;}}return bytes;};

var reptile = require('./action/reptile'),
	fs = require('fs'),
	cheerio = require('cheerio');

reptile.init({
	// proxy:{
	// 	host:'127.0.0.1',
	// 	port: 8888
	// },
	threads:5,
	initTotal:{
		url: 'http://www.resgain.net/netname_33_1.html',
		onCrawl: function(buffer){
			var html = buffer.toString(),
				$ = cheerio.load(html),
                totalText = $('.pagination li a').eq($('.pagination li').length - 1)[0].attribs.href,
                myTotal = Number(totalText.replace(/^[^_]*_\d+_/,'').replace(/\.html$/,'')),
				r = [];
            console.log('totalText',totalText);
			for(var i = 1; i <= myTotal; i++){
                r.push('http://www.resgain.net/netname_33_' + i + '.html');
			}
            console.log(r);
			return r;

		}

	},

	onCrawl: function(buffer){
		var html = buffer.toString(),
			$ = cheerio.load(html),
            items = $('.btn1');
            pickData = [],
            myText = '';

        for(var i = 0, len = items.length; i < len; i++){
            myText = items.eq(i).text();
            if(myText.getBytes() <= 28){
                pickData.push(myText);
            }
        }
		
		return pickData;
	},

	callback: function(data){
        fs.writeFile('data.txt', JSON.stringify(data), function(er){
			if(er){
				console.log('save fail:' + er.message);
			} else {
				console.log('all is done:' + data.length);
			}
		})
		
	}
});
