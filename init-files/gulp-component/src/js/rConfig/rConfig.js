var require = {
    // baseUrl: '../js',
    paths: {
        jquery: '../../js/lib/jQuery/jquery-1.11.1.js'
    },
    shim: {
    }
};

if(typeof module === "object" && typeof module.exports === 'object'){
    module.exports = require;
}
