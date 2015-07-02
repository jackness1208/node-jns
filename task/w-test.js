var os = require('os');
module.exports = function(){
    console.log(os.networkInterfaces());
};
