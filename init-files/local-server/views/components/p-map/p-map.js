!function(global, undefined){
    var treeList = document.getElementById('treeList'),
        buildItem = function(list){
            var r = '';
            if(!list){
                return r;
            }

            var fileType = '',
                fileExt = '';
            for(var i = 0, obj, len = list.length; i < len; i++){
                obj = list[i];
                
                if(!obj.href){
                    fileType = 'tree-tl-doc';
                } else {
                    fileExt = obj.href.split('.').pop();
                    switch(fileExt){
                        case "css": 
                            fileType = 'tree-tl-css';
                            break;
                        case "js":
                            fileType = 'tree-tl-js';
                            break;
                        case "html":
                            fileType = 'tree-tl-html';
                            break;
                        default:
                            fileType = 'tree-tl-other';
                            break;
                    }
                }
                r += [
                    '<li>',
                    '<div class="tree-tl '+ fileType +'"><i class="tree-icon"><i class="tree-icon-cnt"></i></i><a href="'+ (obj.href? obj.href: 'javascript:;') +'">'+ obj.name +'</a></div>',
                        obj.items?'<ul>'+ buildItem(obj.items) +'</ul>':'',
                    '</li>'
                ].join('');
            }
            return r;
        }

    treeList.innerHTML = buildItem(treeData);
    
    // site map
    var docItems = [],
        i, len, fs, myDiv,
        docClickHandle = function(){
            var myParent = this.parentNode;
            ~myParent.className.indexOf('-cur')?(
                myParent.className = myParent.className.replace(/\s*treelist-li-cur\s*/g, ' ')
            ):(
                myParent.className += ' treelist-li-cur'
            );
        };
    for(i = 0, myDiv = treeList.getElementsByTagName('div'), len = myDiv.length; i < len; i++){
        ~myDiv[i].className.indexOf('tree-tl-doc') && docItems.push(myDiv[i]);
    }
    for(i = 0, len = docItems.length; i < len; i++){
        docItems[i].onclick = docClickHandle;
    }
}(this);
