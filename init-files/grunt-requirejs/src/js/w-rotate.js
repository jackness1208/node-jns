'use strict';
(function(){
    var 
        rotate = function(target, classes){
            if(!target){
                return;
            }
            clearTimeout(target.aniKey);
            if(!target.aniIndex){
                target.aniIndex = 1;
            }
            (function doit(){
                var 
                    iClass = target.className,
                    nextIndex;

                iClass = iClass.replace(new RegExp('\\s*'+ classes[target.aniIndex] +'\\s*', 'g'), ' ');

                nextIndex = Math.round(Math.random() * classes.length - 1);
                if(nextIndex >= target.aniIndex){
                    nextIndex += 1;
                }
                iClass += ' ' + classes[nextIndex];

                target.className = iClass;
                target.aniIndex = nextIndex;

                target.aniKey = setTimeout(doit, 2000);

            })();
        };

    if(typeof define != 'undefined'){
        define([], function(){
            return rotate;
        });
    } else {
        window.rotate = rotate;
    }
})();

