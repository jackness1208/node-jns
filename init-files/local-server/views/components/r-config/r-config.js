var require = {
    paths: {
        "util": '../../lib/util/util'
    }
};
if(typeof define != 'undefined'){
    define([], function(){
        return require;
    });
}
