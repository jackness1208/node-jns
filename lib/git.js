var http = require('http'),
    global = require('./global.js'),
    fs =require('fs'),
    fn = global.fn,
    pg = global.pg;

module.exports = {
    // 拖库
    clone: function(src, path){
        var downloadPath = '';

        if(/^http/.test(src)){
            downloadPath = src;
        } else {
            downloadPath = 'https://github.com/' + src + '.git';
        }
        
        fn.msg.success('开始拖库');
         
        // fn.runCMD('git clone ' + downloadPath, function(){
        //     fn.msg.success('拖库完成');
        // });

        // fn.get(downloadPath, function(buffer){
        //     console.log(buffer);
        //     fn.msg.success(src + ' 文件下载完成');
        //     fs.writeFileSync(path + 'master.zip', buffer);
        //     fn.msg.success('文件保存成功');
        // },'buffer');
    },
    

    // 回调
    then: function(fn){

    }
};
