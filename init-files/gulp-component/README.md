# yy.com-v1 项目

## 开发 git
```
http://code.yy.com/ent-FEteam/yy.com.git
```

## host
```
# 211 环境
116.31.121.211	www.yy.com
116.31.121.211	interface.yy.com
116.31.121.211	yyweb.yystatic.com

183.60.218.253	res2.home.yystatic.com
183.60.218.253	res1.home.yystatic.com
183.60.218.253	res0.home.yystatic.com
183.60.218.253	res.home.yystatic.com
183.60.218.253	www.home.yy.com
183.60.218.253	home.yy.com
183.60.218.253	static.home.yy.com

116.31.121.127 earn.yystatic.com
116.31.121.127 m.yy.com
116.31.121.127	static.m.yy.com
116.31.121.127	act.m.yystatic.com
116.31.121.127 act1.m.yystatic.com

59.34.148.215	inf.pay.duowan.com
59.34.148.215	pay.duowan.com
59.34.148.215	zhpay.duowan.com

61.155.170.14  weblbs.yystatic.com
61.155.170.14  webyylbs.yy.duowan.com

116.31.122.23	concertadmin.m.yy.com

121.14.36.30	c5.webyy.yy.com
121.14.36.30	c4.webyy.yy.com
121.14.36.30	c3.webyy.yy.com
121.14.36.30	c2.webyy.yy.com
121.14.36.30	c1.webyy.yy.com
121.14.36.30	webyy.yy.com

116.31.122.30	upload.shenqu.yy.com


# yy.com-v1 预发布
115.231.33.138 www.yy.com
115.231.33.138 yyweb.yystatic.com


# yy.com-v1 线上
61.145.54.170 www.yy.com
61.145.54.170 yyweb.yystatic.com

```

## 环境要求
运行此项目， 你电脑上必须安装以下组件:
* node
* ruby
* gulp
* sass

## 初始化开发环境

```
node build
```

## gulp 命令

```Bash
# 压缩合并 js
gulp js --name <project>

# 压缩合并 css
gulp css --name <project>

# 压缩合并 jade,html
gulp html --name <project>

# 压缩合并 image
gulp images --name <project>

# 压缩合并 执行 js、css、html、images
gulp all --name <project>

# 执行监听
gulp watch --name <project>

# 压缩合并 执行 all 并且 监听
gulp watchAll --name <project>

# 拷贝 config.copy 下的文件
gulp copy --name <project>

# 提交代码 到 测试/ 预发布环境
gulp commit --name <project>  --sub <branch> 
```

```
@param <project>:  pc|mobile
@param <branch>:   dev|commit|trunk
```


## livereload 

* 安装 插件[这里](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei)

* 打开chrome 扩展程序 [chrome://extensions/] 对插件 勾选 允许访问文件网址

* 打开 html 文件时 点击 chrome 上面图标激活插件

## 自定义配置文件
1. 在根目录 创建 `config.mine.js` 文件
2. 把要 config.js 中需要自定义的 属性 存放在 config.mine.js 文件。 demo 如下

```js
var config = {
    'pc': {
        svn: {
            path: {
                dev: '../../../svn.yy.com/yy-music/web-dragon/star-fans/yyweb/branches/develop',
            }
        }
    }
};

module.exports = config;
```



