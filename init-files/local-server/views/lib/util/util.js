define([], function(){
    var util = {
        /**
         * promise 模块
         */
        Promise: function(fn){
            var she = this;
            
            she.queue = [];
            she.current = 0;
            she.then = function(fn){
                typeof fn == 'function' && she.queue.push(fn);
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
         * 字符串转 utf8编码
         * @param {string}  文本
         * @return {string} 转化后文本
         */
        utf8Encode: function(str){
            if(typeof str != 'string'){
                return str;
            }
            return str.replace(/[\u4E00-\u9FA5]/g, function($1){ return "\\u" + ("00"+$1.charCodeAt().toString(16)).slice(-4);});
        },
        
        /**
         * 判断对象类别
         * @param {Anything} 对象
         * @return {string}  类型
         */
        type: function (obj) {
            var type,
                toString = Object.prototype.toString;
            if (obj == null) {
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
                if ((options = arguments[i]) != null) {
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

    return util;
});
