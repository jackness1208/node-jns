/*!
 * gulpfile.js for yym-FETeam
 *
 * @author: jackness Lau
 */
'use strict';


var gulp = require('gulp'),
    fs = require('fs'),
    path = require('path'),
    sass = require('gulp-ruby-sass'), // sass compiler
    //sass = require('gulp-sass'), // sass compiler
    minifycss = require('gulp-minify-css'), // minify css files
    jshint = require('gulp-jshint'), // check js syntac
    uglify = require('gulp-uglify'), // uglify js files
    imagemin = require('gulp-imagemin'), // minify images
    rename = require('gulp-rename'), // rename the files
    concat = require('gulp-concat'), // concat the files into single file
    wrap = require('gulp-wrap'), // wrap the stream contents
    wrapAMD = require('gulp-wrap-amd'), // wrap the file with AMD wrapper
    notify = require('gulp-notify'), // notify the msg during running tasks
    replacePath = require('gulp-replace-path'), // replace the assets path
    requirejsOptimize = require('gulp-requirejs-optimize'), // requirejs optimizer which can combine all modules into the main js file
    inlinesource = require('gulp-inline-source'), // requirejs optimizer which can combine all modules into the main js file
    filter = require('gulp-filter'), // filter the specified file(s) in file stream
    gulpJade = require('gulp-jade'),
    colors = require('colors'),
    livereload = require('gulp-livereload'),
    through = require('through2'),
    plumber = require('gulp-plumber'),
    runSequence = require('run-sequence').use(gulp),
    es = require('event-stream'),
    prettify = require('gulp-prettify');

var config = require('./config.js'),
    localConfig = fs.existsSync('./config.mine.js')? require('./config.mine.js'): {};



var fn = {
    blankPipe: function(){
        return through.obj(function(file, enc, next){next(null, file);});
    },
    /**
     * 运行 cmd
     * @param  {String|Array} str           cmd执行语句 or 数组
     * @param  {funciton}     callback      回调函数
     *                        - json.status 状态码 1:成功, 0:失败
     *                        - json.error  错误信息
     * @return {Void}
     */
    runCMD: function(str, callback, path, showOutput){
        var myCmd = require('child_process').exec,
            r = {
                status:0,
                error:''
            },
            child;

        if(showOutput === undefined){
            showOutput = true;
        }
        if (!str) {
            r.error = '没任何 cmd 操作';
            return callback(r);
            
        }
        if (!/Array/.test(Object.prototype.toString.call(str))) {
            str = [str];
        }

        child = myCmd(str.join(" && "),{
            maxBuffer: 2000 * 1024,
            cwd: path || ''
        }, function(err){
            if(err){
                // r.error = err.stack.replace(/(\r|\n|\t)+/g,';').replace(/\s+/g,' ').replace(/:[^;:]+;/g,':');
                if(showOutput){
                    console.log('cmd运行 出错');
                    console.log(err.stack);
                }
                r.error = 'cmd运行 出错';
                return callback(r);
                
            } else {
                r.status = 1;
                return callback(r);
            }

        });
        child.stdout.setEncoding('utf8');
        
        if(showOutput){
            child.stdout.pipe(process.stdout);
            child.stderr.pipe(process.stderr);
        }
        
    },
    
    /**
     * 删除文本
     * ------------
     * 单个文本方法
     * -------------
     * @param  {String}   path
     * @param  {function} callback
     * @param  {RegExp}   filters
     *
     * --------------
     * 多个目录/文件方法
     * --------------
     * @param  {Array}    list
     * @param  {function} callback 回调方法
     * @param  {RegExp}   filters  忽略文件用 滤镜，选填参数
     *
     * @return {Void}
     */
    removeFiles: function(list, callback, filters){///{
        if(!fn.isArray(list)){
            list = [list];
        }
        
        var rmFile = function(file, filters){
                if(!fs.existsSync(file) || (filters && filters.test(file))){
                    return;
                }
                try{
                    fs.unlinkSync(file);
                } catch(er){}

            },
            rmPath = function(iPath, filters){
                var list = fs.readdirSync(iPath);

                list.forEach(function(item){
                    var file = path.join(iPath, item);
                   
                    if(filters && filters.test(file)){

                    } else {
                        var stat = fs.statSync(file);
                            
                        if(stat.isDirectory()){
                            rmPath(file, filters);
                            try{
                                fs.rmdirSync(file);
                            } catch(er){}

                        } else {
                            rmFile(file);
                        }
                    }
                });
            };

        list.forEach(function(item){
            if(!item || !fs.existsSync(item)){
                return;
            }

            var stat = fs.statSync(item);
            if(stat.isDirectory()){
                rmPath(item, filters);
            } else {
                rmFile(item, filters);
            }
            
        });
        if(callback){
            callback();
        }
    },///}


    /**
     * 判断是否数组
     * @param  {Anything}  需要判断的对象
     * @return {Boolean}  是否数组
     */
    isArray: function(arr){
        return /Array/.test(Object.prototype.toString.call(arr));
    },

    Promise: function(fn){
        var she = this;
        
        she.queue = [];
        she.current = 0;
        she.then = function(fn){
            if(typeof fn == 'function'){
                she.queue.push(fn);
            }
            return she;
        };
        she.start = function(){
            var myArgv = Array.prototype.slice.call(arguments);
            she.resolve.apply(she, myArgv);
        };

        she.resolve = function(){
            var myArgv = Array.prototype.slice.call(arguments);
            
            myArgv.push(she.resolve);
            if(she.current){
                myArgv.push(she.queue[she.current - 1]);
            }

            if(she.current != she.queue.length){
                she.queue[she.current++].apply(she, myArgv);
            }
        };
        if(fn){
            she.then(fn);
        }

        
    },
    /**
     * 判断对象类别
     * @param {Anything} 对象
     * @return {string}  类型
     */
    type: function (obj) {
        var type,
            toString = Object.prototype.toString;
        if (obj === null) {
            type = String(obj);
        } else {
            type = toString.call(obj).toLowerCase();
            type = type.substring(8, type.length - 1);
        }
        return type;
    },

    isPlainObject: function (obj) {
        var she = this,
            key,
            hasOwn = Object.prototype.hasOwnProperty;

        if (!obj || she.type(obj) !== 'object') {
            return false;
        }

        if (obj.constructor &&
            !hasOwn.call(obj, 'constructor') &&
            !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
            return false;
        }

        for (key in obj) {}
        return key === undefined || hasOwn.call(obj, key);
    },

    /**
     * 扩展方法(来自 jQuery)
     * extend([deep,] target, obj1 [, objN])
     * @base she.isPlainObject
     */
    extend: function () {
        var she = this,
            options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if (typeof target === 'boolean') {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            i = 2;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if (typeof target !== 'object' && she.type(target) !== 'function') {
            target = {};
        }

        // extend caller itself if only one argument is passed
        if (length === i) {
            target = this;
            --i;
        }

        for (; i<length; i++) {
            // Only deal with non-null/undefined values
            if ((options = arguments[i]) !== null) {
                // Extend the base object
                for (name in options) {
                    src = target[name];
                    copy = options[name];

                    // Prevent never-ending loop
                    if (target === copy) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if (deep && copy && (she.isPlainObject(copy) || (copyIsArray = she.type(copy) === 'array'))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && she.type(src) === 'array' ? src : [];
                        } else {
                            clone = src && she.isPlainObject(src) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[name] = she.extend(deep, clone, copy);

                    // Don't bring in undefined values
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
    }
};
path.joinFormat = function(){
    var iArgv = Array.prototype.slice.call(arguments);
    var r = path.join.apply(path, iArgv);
    return r
        .replace(/\\+/g, '/')
        .replace(/(^http[s]?:)[\/]+/g, '$1//');
};

config = fn.extend(true, config, localConfig);


gulp.task('--help', function(){
    console.log([
        '',
        '',
        '  Ustage:'.yellow + ' gulp <command> --name <project>',
        '',
        '',
        '  Commands:'.yellow,
        '    ' + 'init'.gray + '                  init project',
        '    ' + 'watchAll'.gray + '              optimize & wath the target',
        '    ' + 'all'.gray + '                   optimize the target',
        '    ' + 'js'.gray + '                    optimize the project js file',
        '    ' + 'css'.gray + '                   optimize the project sass file',
        '    ' + 'html'.gray + '                  optimize the project jade file',
        '    ' + 'copy'.gray + '                  copy the project to dev & test Path',
        '    ' + 'commit --sub <branch>'.gray + ' commit the project to dev & test Path',
        '',
        '',
        '  Project:'.yellow,
        '    ' + 'pc'.gray + '                    web site',
        '    ' + 'mobile'.gray + '                mobile site',
        '',
        '',
        '  Branch:'.yellow,
        '    ' + 'dev'.gray + '                   branch dev',
        '    ' + 'commit'.gray + '                branch commit',
        '    ' + 'trunk'.gray + '                 branch trunk',
        '',
        '',
        '  Options:'.yellow,
        '    ' + '-h, --help'.gray + '            output usage information',
        '',
        ''
    ].join('\n'));
});

gulp.task('default', function(){
    gulp.run('--help');
});

gulp.task('-h', function(){
    gulp.run('--help');
});



// 初始化目录
gulp.task('init', function(){

    //..
    // init project
});

function ctxRender(ctx){
    var vars = gulp.env.vars;
    if(vars){
        for(var key in vars){
            if(vars.hasOwnProperty(key)){
                ctx = ctx.replace(new RegExp('\\{\\$'+ key +'\\}', 'g'), vars[key]);
            }
        }
    }
    return ctx;

}

function taskHelper(commands){
    var dirs = [];
    for(var key in config){
        if(config.hasOwnProperty(key)){
            dirs.push(key);
        }
    }

    var output = [
        '',
        '',
        '  Ustage:'.yellow,
        '  gulp '+ commands +' --name <Project>',
        '',
        '  Project:'.yellow,
        (function(){
            var r = [];
            dirs.forEach(function(item){
                r.push('  ' + item.gray);
            });
            return r.join('\n');

        }()),
        '',
        ''
    ];
    console.log(output.join('\n'));
}

/**
 * task 执行前初始化函数
 */
function taskInit(){
    process.chdir(__dirname);

    var commands = process.argv[2];
    var iArgv = process.argv.slice(4),
        iName = iArgv[0];

    iArgv.forEach(function(item, i){
        switch(item){
            case '--ver':
                gulp.env.version = iArgv[i + 1];
                break;

            case '--sub':
                gulp.env.subname = iArgv[i + 1];
                break;

            default:
                break;
        }
    });

    if(iName){
        gulp.env.project = iName;
    }

    var isCommit = gulp.env.isCommit;


    var iProject = gulp.env.project;
    if(!iProject || !config[iProject]){
        taskHelper(commands);
        process.exit();
        return;

    } else {
        if(!gulp.env.hasInit && gulp.env.version){
            config[iProject].src = path.joinFormat(config[iProject].src, gulp.env.version);
            gulp.env.hasInit = true;
        }
        if(isCommit){
           config[iProject].isCommit = true;

            if(gulp.env.subname){
                gulp.env.vars = {
                    PATH: config[iProject].svn.path[gulp.env.subname],
                    PATH2: config[iProject].svn.path2[gulp.env.subname],
                    SRC: config[iProject].src
                };
            }

        } else {
            config[iProject].isCommit = false;
        }
        

        return config[iProject];
    }
}

gulp.task('js', function (done) {
    runSequence('js-task', 'concat', done);
});
gulp.task('js-task', function () {
    var iConfig = taskInit();
    if(!iConfig){
        return;
    }

    /* requirejs 主模块列表 & 页面js [start] */
    var rjsFilter = filter(function (file) {
            var result = /(p\-[a-zA-Z0-9_]*)[\\\/](p\-[a-zA-Z0-9_]*)\.js$/.test(file.path);
            if(result){
                file.base = path.joinFormat(file.path.replace(/(p\-[a-zA-Z0-9_]*)\.js$/, ''));
            }
            return result;
        });
    /* requirejs 主模块列表 & 页面js [end] */

        // jsTask
        var jsStream = gulp.src(path.join(__dirname, iConfig.src, 'components/**/*.js'))
            .pipe(plumber())
            .pipe(jshint.reporter('default'))
            .pipe(rjsFilter)
            .pipe(jshint())
            /* 合并主文件中通过 requirejs 引入的模块 [start] */
            .pipe(requirejsOptimize({
                optimize: 'none',
                mainConfigFile: path.joinFormat(__dirname, iConfig.src, 'js/rConfig/rConfig.js')
            }))
            // .pipe(iConfig.isCommit? uglify(): through.obj(function(file, enc, next){next();}))
            .pipe(iConfig.isCommit?uglify(): fn.blankPipe())
            .pipe(rename(function(path){
                path.basename = path.basename.replace(/^p-/g,'');
                path.dirname = '';
            }))
            .pipe(gulp.dest(path.joinFormat(__dirname, 'dist', iConfig.dest.path.js)))
            // .pipe(notify({ message: 'JS task complete' }))
            .pipe(livereload({quiet: true}));

        // js lib Task
        var jsLibStream = gulp.src(path.joinFormat(__dirname, iConfig.src, 'js/lib/**/*.js'))
            .pipe(plumber())
            .pipe(iConfig.isCommit?uglify():fn.blankPipe())
            .pipe(gulp.dest(path.joinFormat('dist', iConfig.dest.path.jsLib)));

    return es.concat.apply(es, [jsStream, jsLibStream]);
});

gulp.task('html', function(){
    var iConfig = taskInit();
    if(!iConfig){
        return;
    }

    var 
        events = [],
        // tmpl task
        tmplStream = gulp.src( path.joinFormat(__dirname, iConfig.src, 'components/@(p-)*/*.jade'))
            .pipe(plumber())
            .pipe(gulpJade({
                pretty: true,
                client: false
            }))
            .pipe(through.obj(function(file, enc, next){
                var iCnt = file.contents.toString();
                var pathReg = /(src|href|data-main|data-original)\s*=\s*(['"])([^'"]*)(["'])/ig;
                // script 匹配
                var scriptReg = /(<script[^>]*>)([\w\W]*?)(<\/script\>)/ig;
                var dirname = path.joinFormat(__dirname, iConfig.src, 'html');
                iCnt = iCnt
                    // 隔离 script 内容
                    .replace(scriptReg, function(str, $1, $2, $3){
                        return $1 + escape($2) + $3;
                    })
                    .replace(pathReg, function(str, $1, $2, $3, $4){
                        var iPath = $3,
                            rPath = '';

                        if(iPath.match(/^(data:image|javascript:|#|http:|https:|\/)/) || !iPath){
                            return str;
                        }


                        var fDirname = path.dirname(path.relative(dirname, file.path));
                        rPath = path.joinFormat(fDirname, iPath)
                            .replace(/\\+/g,'/')
                            .replace(/\/+/, '/')
                            ;

                        return $1 + '=' + $2 + rPath + $4;
                    })
                    // 取消隔离 script 内容
                    .replace(scriptReg, function(str, $1, $2, $3){
                        return $1 + unescape($2) + $3;
                    });

                file.contents = new Buffer(iCnt, 'utf-8');
                this.push(file);
                next();
            }))
            .pipe(rename(function(path){
                path.basename = path.basename.replace(/^p-/g,'');
                path.dirname = '';
            }))
            .pipe(prettify({'indent_size': 4}))
            .pipe(gulp.dest(path.joinFormat(__dirname, iConfig.src, 'html')));

    events.push(tmplStream);

    // if(iConfig.isCommit){
        // html task
        var htmlStream = gulp.src( path.joinFormat(__dirname, iConfig.src, 'html/*.html'))
            .pipe(plumber())
            .pipe(inlinesource())
            // 删除requirejs的配置文件引用
            .pipe(replacePath(/<script [^<]*local-usage\><\/script>/g, ''))

            // 替换全局 图片
            .pipe(replacePath(
                path.joinFormat(
                    path.relative(
                        path.join(__dirname, iConfig.src, 'html'),
                        path.join(__dirname, iConfig.global.components)
                    )
                ),
                path.joinFormat(iConfig.dest.hostname, iConfig.dest.path.images, 'globalcomponents')
            ))
            .pipe(replacePath('../js/lib', path.joinFormat(iConfig.dest.hostname, iConfig.dest.path.jsLib)))
            .pipe(replacePath(/\.\.\/components\/p-\w+\/p-(\w+).js/g, path.joinFormat(iConfig.dest.hostname, iConfig.dest.path.js, '/$1.js')))

            .pipe(replacePath('../css', path.joinFormat(iConfig.dest.hostname, iConfig.dest.path.css)))

            .pipe(replacePath('../images', path.joinFormat(iConfig.dest.hostname, iConfig.dest.path.images)))
            .pipe(replacePath(/\.\.\/(components\/[pw]-\w+\/images)/g, path.joinFormat(iConfig.dest.hostname, iConfig.dest.path.images, '$1')))
            // .pipe(replacePath('../images', + assetsPath.images))
            .pipe(gulp.dest( path.joinFormat(__dirname, 'dist', iConfig.dest.path.html )))
            .pipe(livereload({quiet: true}));

        events.push(htmlStream);
    // }

    return es.concat.apply(es, events);
});
gulp.task('css', function(done) {
    runSequence('css-task', 'concat', done);

});

gulp.task('css-task', function() {
    var iConfig = taskInit();
    if(!iConfig){
        return;
    }
    process.chdir( path.joinFormat(__dirname, iConfig.src, 'components'));
    return sass('./', { style: 'nested', 'compass': true })
        .pipe(filter('@(p-)*/*.css'))
        .pipe(through.obj(function(file, enc, next){
            var iCnt = file.contents.toString();
            var pathReg = /(url\s*\(['"]?)([^'"]*?)(['"]?\s*\))/ig;
            var pathReg2 = /(src\s*=\s*['"])([^'" ]*?)(['"])/ig;
            var dirname = path.joinFormat(__dirname, iConfig.src, 'css');

            var replaceHandle = function(str, $1, $2, $3){
                var iPath = $2,
                    rPath = '';

                if(iPath.match(/^(about:|data:)/)){
                    return str;
                }

                var fDirname = path.dirname(path.relative(dirname, file.path));
                rPath = path.join(fDirname, iPath)
                    .replace(/\\+/g,'/')
                    .replace(/\/+/, '/')
                    ;
                if(fs.existsSync(path.joinFormat(dirname, rPath).replace(/\?.*?$/g,''))){
                    return $1 + rPath + $3;

                } else {

                    console.log(([
                        '',
                        '[error] css url replace error!',
                        file.history,
                        '[' + rPath + '] is not found!'].join("\n")
                    ).yellow);
                    return str;
                }

            };


            iCnt = iCnt
                .replace(pathReg, replaceHandle)
                .replace(pathReg2, replaceHandle);

            file.contents = new Buffer(iCnt, 'utf-8');
            this.push(file);
            next();
        }))
        .pipe(rename(function(path){
            path.dirname = '';
            path.basename = path.basename.replace(/^p-/,'');
        }))
        .pipe(gulp.dest('../css/'))
        // 替换全局 图片
        .pipe(replacePath(
            path.joinFormat(
                path.relative(
                    path.join(__dirname, iConfig.src, 'css'),
                    path.join(__dirname, iConfig.global.components)
                )
            ),
            path.joinFormat(iConfig.dest.hostname, iConfig.dest.path.images, 'globalcomponents')
        ))

        .pipe(replacePath('../images', path.joinFormat(iConfig.dest.hostname, iConfig.dest.path.images)))
        .pipe(replacePath('../components', path.joinFormat(iConfig.dest.hostname, iConfig.dest.path.images, 'components')))
        .pipe(iConfig.isCommit?minifycss({
            compatibility: 'ie7'
        }): fn.blankPipe())
        
        .pipe(gulp.dest( path.joinFormat(__dirname, 'dist', iConfig.dest.path.css)))
        // .pipe(notify({ message: 'CSS task complete' }))
        .pipe(livereload({quiet: true}))
        ;
});

gulp.task('images',['images-img', 'images-components', 'images-globalcomponents'], function() {

});
gulp.task('images-img', function() {
    var iConfig = taskInit();
    if(!iConfig){
        return;
    }
    return gulp.src([ path.joinFormat(__dirname, iConfig.src, 'images/**/*.*')], {base: path.joinFormat(__dirname, iConfig.src, 'images')})
        .pipe(filter(['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.bmp', '**/*.gif']))
        .pipe(iConfig.isCommit?imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }): fn.blankPipe())
        .pipe(gulp.dest( path.joinFormat(__dirname, 'dist', iConfig.dest.path.images)))
        // .pipe(notify({ message: 'Images-img task complete' }))
        .pipe(livereload({quiet: true}));
});
gulp.task('images-components', function(){
    var iConfig = taskInit();
    if(!iConfig){
        return;
    }
    return gulp.src([
            path.joinFormat(__dirname, iConfig.src, 'components/**/*.*'),
            '!**/*.tpl',
            '!**/*.jade',
            '!**/*.js',
            '!**/*.scss',
            '!**/*.html',
            '!**/*.css',
            '!**/*.md',
            '!**/*.psd'
        ], {
            base: path.joinFormat(__dirname, iConfig.src, 'components')
        })
        .pipe(plumber())
        .pipe(iConfig.isCommit?imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }): fn.blankPipe())
        .pipe(gulp.dest( path.joinFormat(__dirname, 'dist', iConfig.dest.path.images, 'components')))
        // .pipe(notify({ message: 'Images-components task complete' }))
        .pipe(livereload({quiet: true}));
});
gulp.task('images-globalcomponents', function(){
    var iConfig = taskInit();
    if(!iConfig){
        return;
    }
    var rConfig = require(path.joinFormat(__dirname, iConfig.src, 'js/rConfig/rConfig.js')),
        copyPaths = [],
        fPath;

    for(var key in rConfig.paths){
        if(rConfig.paths.hasOwnProperty(key)){
            fPath = path.joinFormat(__dirname, iConfig.src, 'js/rConfig', path.dirname(rConfig.paths[key]));
            if(new RegExp('^' + path.joinFormat(__dirname, iConfig.global.components)).test(fPath)){
                copyPaths.push(path.joinFormat(fPath, '**/*.*'));
            }
        }
    }

    if(!copyPaths.length){
        return console.log('[notice] no globalcomponents in this project'.yellow);
    }


    return gulp.src(copyPaths, {
            base: path.joinFormat(__dirname, iConfig.global.components)
        })
        .pipe(plumber())
        .pipe(filter(['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.bmp', '**/*.gif']))
        .pipe(gulp.dest(path.joinFormat(__dirname, 'dist', iConfig.dest.path.images, 'globalcomponents')))
        // .pipe(notify({ message: 'Images-globalcomponents task complete' }))
        .pipe(livereload({quiet: true}));
});



gulp.task('watch', function() {
    var iConfig = taskInit();
    if(!iConfig){
        return;
    }
    livereload.listen();


    // 看守所有.scss档
    gulp.watch( path.joinFormat(__dirname, iConfig.src, '**/*.scss'), ['css']);

    // 看守所有.js档
    gulp.watch([
        path.joinFormat(__dirname, iConfig.src, 'components/**/*.js'),
        path.joinFormat(__dirname, iConfig.src, 'js/lib/**/*.js'),
        path.joinFormat(__dirname, iConfig.global.components, '**.*.js')
    ], ['js']);

    // 看守所有图片档
    gulp.watch([
        path.joinFormat(__dirname, iConfig.src, 'images/*.*'),
        path.joinFormat(__dirname, iConfig.src, 'components/**/images/*.*'),
        path.joinFormat(__dirname, iConfig.global.components, '**/images/*.')
    ], ['images']);

    // 看守所有jade 文件
    gulp.watch([
        path.joinFormat(__dirname, iConfig.src, 'components/**/*.jade'),
        path.joinFormat(__dirname, iConfig.src, 'templates/**/*.jade'),
        path.joinFormat(__dirname, iConfig.global.components, '**/*.jade')
    ], ['html']);


});
gulp.task('copy', function(){
    gulp.env.isCommit = true;
    var iConfig = taskInit();
    if(!iConfig){
        return;
    }
    var 
        svnConfig = iConfig.svn,
        iBranch = gulp.env.subname;

    gulp.env.subname.commitTime = new Date();
    

    if(!iBranch || !svnConfig.path[iBranch]){
        return console.log(gulp.env.subname + ' is not in svnConfig'.red);
    }

    if(!svnConfig.copy){
        return;
    }

    var events = [],
        iStat,
        iPath,
        iStream,
        dests;
    for(var src in svnConfig.copy){
        if(svnConfig.copy.hasOwnProperty(src)){
            iPath = path.joinFormat(__dirname, ctxRender(src, iConfig));
            iStat = fs.statSync(iPath);

            if(iStat.isDirectory()){
                console.log('[source] ', path.joinFormat(__dirname, ctxRender(src, iConfig), '**/*.*').yellow);
                iStream = gulp.src(path.joinFormat(__dirname, ctxRender(src, iConfig), '**/*.*'));

            } else {
                console.log('[source] ', path.joinFormat(__dirname, ctxRender(src, iConfig)).yellow);
                iStream = gulp.src([path.joinFormat(__dirname, ctxRender(src, iConfig))]);
            }

            dests = svnConfig.copy[src];

            dests.forEach(function(dest){
                console.log('[target] ', path.joinFormat(__dirname, ctxRender(dest)).green);
                iStream.pipe(gulp.dest(path.joinFormat(__dirname, ctxRender(dest))));
            });
            events.push(iStream);
        }
    }
    return es.concat.apply(es, events);
});

gulp.task('concat', function(){
    var iConfig = taskInit();
    if(!iConfig){
        return;
    }
    if(!iConfig.dest.concat){
        return;
    }


    var events = [];
    for(var dist in iConfig.dest.concat){
        if(iConfig.dest.concat.hasOwnProperty(dist)){
            var iSrcs = [];
            iConfig.dest.concat[dist].forEach(function(src){
                iSrcs.push(path.joinFormat(__dirname, 'dist', src));
            });
            var iStream = gulp.src(iSrcs);

            iStream
                .pipe(concat(path.joinFormat(__dirname, 'dist', dist)))
                .pipe(gulp.dest(path.joinFormat(__dirname, 'dist', dist)))
                .pipe(notify({ message: 'concat task complete' }));

            events.push(iStream);
        }
    }
    return es.concat.apply(es, events);


    
});

gulp.task('commit', function(done){
    gulp.env.isCommit = true;
    runSequence('commit-step01', 'all', 'copy', 'commit-step03', done);
});

/* 覆盖 mobile 播放页的绝对路径改为相对路径 */
gulp.task('pathOverride', function(event){
    var iConfig = taskInit();
    if(!iConfig){
        return event();
    }
    if(!iConfig.dest.playPage){
        return event();
    }

    var filterAll = filter(function (file) {
        var result = /play\_[a-zA-Z0-9_]*\.(css|js|html)$/.test(file.path);
        if(result){
            console.log('fAll: ' + file.path);
        }
        return result;
    }), filterHTML = filter(function (file) {
        var result = /play\_[a-zA-Z0-9_]*\.html$/.test(file.path);
        if(result){
            console.log('fHTML: ' + file.path);
        }
        return result;
    }, {restore: true}), 
    filterJS = filter(function (file) {
        var result = /play\_[a-zA-Z0-9_]*\.js$/.test(file.path);
        if(result){
            console.log('fJS: ' + file.path);
        }
        return result;
    }, {restore: true}), 
    filterCSS = filter(function (file) {
        var result = /play\_[a-zA-Z0-9_]*\.css$/.test(file.path);
        if(result){
            console.log('fCSS: ' + file.path);
        }
        return result;
    }, {restore: true});

    return gulp.src([path.joinFormat(__dirname, 'dist', iConfig.dest.path.html, '*.html'), 
            path.joinFormat(__dirname, 'dist', iConfig.dest.path.js, '*.js'), 
            path.joinFormat(__dirname, 'dist', iConfig.dest.path.css, '*.css')])
        .pipe(filterAll)
        .pipe(replacePath(path.joinFormat(iConfig.dest.hostname, iConfig.dest.path.jsLib), path.joinFormat(iConfig.dest.playPage.hostname, iConfig.dest.playPage.path.jsLib)))
        .pipe(replacePath(path.joinFormat(iConfig.dest.hostname, iConfig.dest.path.js), path.joinFormat(iConfig.dest.playPage.hostname, iConfig.dest.playPage.path.js)))
        .pipe(replacePath(path.joinFormat(iConfig.dest.hostname, iConfig.dest.path.css), path.joinFormat(iConfig.dest.playPage.hostname, iConfig.dest.playPage.path.css)))
        .pipe(replacePath(path.joinFormat(iConfig.dest.hostname, iConfig.dest.path.images), path.joinFormat(iConfig.dest.playPage.hostname, iConfig.dest.playPage.path.images)))

        .pipe(filterHTML)
        .pipe(gulp.dest(path.joinFormat(__dirname, 'dist', iConfig.dest.path.html)))
        .pipe(filterHTML.restore())

        .pipe(filterJS)
        .pipe(gulp.dest(path.joinFormat(__dirname, 'dist', iConfig.dest.path.js)))
        .pipe(filterJS.restore())

        .pipe(filterCSS)
        .pipe(gulp.dest(path.joinFormat(__dirname, 'dist', iConfig.dest.path.css)))
        .pipe(filterCSS.restore())

        .pipe(notify({ message: 'pathOverride task complete' }));
});

gulp.task('commit-step01', function(done){
    gulp.env.isCommit = true;

    var iConfig = taskInit();
    if(!iConfig){
        return;
    }
    var 
        svnConfig = iConfig.svn,
        gitConfig = iConfig.git,
        iBranch = gulp.env.subname;

    gulp.env.subname.commitTime = new Date();
    

    if(!iBranch || !svnConfig.path[iBranch]){
        return console.log(gulp.env.subname + ' is not in svnConfig'.red);
    }

    console.log('commit step 01 start'.yellow);
    new fn.Promise(function(NEXT){ // 删除动态文件
        // update 文件
        if(svnConfig.update){
            var iPromise = new fn.Promise();

            svnConfig.update.forEach(function(iPath){
                var mPath = path.joinFormat(__dirname, ctxRender(iPath));
                iPromise.then(function(next){
                    console.log(('svn update \n['+ mPath +']').yellow);
                    fn.runCMD('svn update', function(){
                        console.log('done'.green);
                        next();
                    }, mPath, true);
                });
                
            });
            iPromise.then(function(){
                console.log('svn config.udpate is done'.yellow);
                NEXT();
            });
            iPromise.start();

        } else {
            console.log('svn config.udpate is blank'.yellow);
            next();
        }
    }).then(function(NEXT){ // update git
        // update 文件
        if(gitConfig.update){
            var iPromise = new fn.Promise();

            gitConfig.update.forEach(function(iPath){
                var mPath = path.joinFormat(__dirname, ctxRender(iPath));
                iPromise.then(function(next){
                    console.log(('git pull \n['+ mPath +']').yellow);
                    fn.runCMD('git pull', function(){
                        console.log('done'.green);
                        next();
                    }, mPath, true);
                });
                
            });
            iPromise.then(function(){
                console.log('git config.udpate is done'.yellow);
                NEXT();
            });
            iPromise.start();

        } else {
            console.log('git config.udpate is blank'.yellow);
            NEXT();
        }
        
    }).then(function(next){ // 添加 被删除的文件夹
        var delPath = [];

        // 删除 commit 设置下的文件
        if(svnConfig.commit){
            svnConfig.commit.forEach(function(iPath){
                delPath.push(path.joinFormat(__dirname, ctxRender(iPath)));
            });
        }

        fn.removeFiles(delPath, function(){
            console.log('svn.update, svn.commit files deleted'.yellow);
            next(delPath);
        });

    }).then(function(delPath ,next){ // 添加 被删除的文件夹
        delPath.forEach(function(iPath){
            if(!path.extname(iPath) && !fs.existsSync(iPath)){
                fs.mkdirSync(iPath);
            }
        });
        console.log('svn.update, svn.commit files doc added'.yellow);

        next(delPath);

    }).then(function(delPath ,NEXT){ // update 被删除的文件
        var iPromise = new fn.Promise();


        delPath.forEach(function(iPath){
            iPromise.then(function(next){
                console.log(('svn update ['+ iPath +']').yellow);
                process.chdir(iPath);
                fn.runCMD('svn update', function(){
                    console.log('done'.green);
                    next();
                }, path.joinFormat(iPath), true);
            });
            
        });

        iPromise.then(function(){
            console.log('svn.update, svn.commit files updated'.yellow);
            NEXT();
        });
        iPromise.start();

    }).then(function(){
        console.log('commit step 01 passed'.green);

        if(svnConfig.onBeforeCommit){
            console.log('onBeofreCommit task run'.yellow);
            svnConfig.onBeforeCommit(iBranch);
        }

        done();

    }).start();
    // 拉取 svn 

});

gulp.task('commit-step03', function(){
    gulp.env.isCommit = true;

    var iConfig = taskInit();
    if(!iConfig){
        return;
    }
    var 
        svnConfig = iConfig.svn,
        gitConfig = iConfig.git,
        iBranch = gulp.env.subname;

    // gulp.env.subname.commitTime = new Date();
    

    if(!iBranch || !svnConfig.path[iBranch]){
        return console.log(gulp.env.subname + ' is not in svnConfig'.red);
    }


    console.log('commit step 03 start'.yellow);
    // svn commit！
    var iPromise = new fn.Promise();

    if(svnConfig.commit){
        svnConfig.commit.forEach(function(iPath){
            iPromise.then(function(next){
                var mPath = path.joinFormat(__dirname, ctxRender(iPath));
                console.log(('['+ mPath +']' + '\ncommit start').yellow);
                fn.runCMD([
                    'svn cleanup',
                    'svn add * --force',
                    'svn commit -m gulpAutoCommit'
                ].join(' && '), function(){
                    console.log('done'.green);
                    next();
                }, mPath);
            });
        });
    }
    if(gitConfig.commit){
       gitConfig.commit.forEach(function(iPath){
            iPromise.then(function(next){
                var mPath = path.joinFormat(__dirname, ctxRender(iPath));
                console.log(('['+ mPath +']' + '\ncommit start').yellow);
                fn.runCMD([
                    'git add',
                    'git commit -m "gulpAutoCommit"'
                ].join(' && '), function(){
                    console.log('done'.green);
                    next();
                }, mPath);
            });
        }); 
    }
    iPromise.then(function(){
        console.log('all is done'.green);
        if(gulp.env.commitTime){
            console.log(('total ' + (new Date() -  gulp.commitTime) + ' ms').green);
        }
    });

    iPromise.start();
});


gulp.task('all', function(done){
    runSequence(['js', 'css', 'images', 'html'], /*'pathOverride',*/ 'concat', done);
});

gulp.task('watchAll', ['all', 'watch']);
