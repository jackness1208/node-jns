<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="HandheldFriendly" content="true">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=0">
<title>Local Server Home Page</title>
<script>
!function(){
    if(!/iPhone|Android/i.test(navigator.userAgent)){
        return;
    }
    var screenWidth = document.documentElement.clientWidth;
    var meta = document.createElement('meta'),
        scale = screenWidth / 320;
    meta.name = 'viewport';
    meta.content = 'width=320, initial-scale='+ scale +', maximum-scale='+ scale +', minimum-scale='+ scale +', user-scalable=0';

    document.getElementsByTagName('head')[0].appendChild(meta);
}();
</script>
<style type="text/css">
div, ul, li, a{ margin:0; padding:0; }
ul, li{ list-style:none; }
body{ background: #ccc; font: 12px/1.5 Microsoft Yahei, simsun, sans-serf; color:#333 }
a{ text-decoration: none; color:#333; }
.treelist{ }
.treelist-title{}
.treelist ul ul{ padding-left: 20px;}
.treelist li{ padding-bottom: 5px; }
.treelist a{ color:#1d77bc; display: block;  overflow: hidden;}
.treelist a:hover{ color:blue;  text-decoration: underline;}

.treelist-li-cur{}
.treelist-li-cur .tree-tl-doc{}
.treelist-li-cur .tree-tl-doc .tree-icon{background:#eee;}
.treelist-li-cur .tree-tl-doc .tree-icon-cnt{ background:#eee; }
.treelist-li-cur ul{ display:none; }

.tree-tl-doc{}
.tree-tl-doc a{ cursor: default; color:#444;}
.tree-tl-doc a:hover{ color:#444; text-decoration: none; }
.tree-tl-doc .tree-icon{ float: left; position:relative; width: 12px; height: 8px; margin:7px 5px 0 0; font-size:0; line-height: 0; border: 1px solid #c59b1c; background: #fff170;}
.tree-tl-doc .tree-icon-cnt{content:" "; position:absolute; left: -1px; top: -4px; width: 10px; height: 2px; font-size:0; line-height: 0; border: 1px solid #c59b1c; background: #fff170;}
.tree-tl-js .tree-icon,
.tree-tl-css .tree-icon,
.tree-tl-html .tree-icon,
.tree-tl-other .tree-icon{ float: left; position:relative; width: 8px; height: 7px; padding:2px 1px 0; margin:3px 7px 0 0; font-size:0; line-height: 0; border: 1px solid #999; border-top-width: 4px; }

.tree-tl-js .tree-icon-cnt,
.tree-tl-css .tree-icon-cnt,
.tree-tl-html .tree-icon-cnt,
.tree-tl-other .tree-icon-cnt{ display:block; border-top: 1px solid #999; border-bottom:1px solid #999; font-size:0; line-height:0; height: 2px;}

.tree-tl-js .tree-icon,
.tree-tl-js .tree-icon-cnt{ border-color:#8fc31f;}
.tree-tl-css .tree-icon,
.tree-tl-css .tree-icon-cnt{ border-color:#8fc31f;}
.tree-tl-html .tree-icon,
.tree-tl-html .tree-icon-cnt{ border-color:#00b7ee;}
.tree-tl-other .tree-icon,
.tree-tl-other .tree-icon-cnt{ border-color:#999;}

.main-mod{margin: 10px; border:1px solid #ccc; padding: 20px; background:#fff; font-size: 14px;}
.main-mod-tl{ display: block; text-align: left; font-size:18px; color:#444; padding-bottom:10px;  margin-bottom: 10px; border-bottom: 1px solid #ccc;}
.main-mod-cnt{}

.server-trans-txt { width: 99.4%; height: 150px; resize: vertical;}
.server-trans-btn { padding: 5px 10px; }
.server-output {border: 1px solid #ccc; padding: 8px; margin-bottom: 8px; background:#ddd; height: 200px;}
</style>
</head>
<body>


<div class="main-mod" >
    <div class="main-mod-tl">site map</div>
    <div class="main-mod-cnt treelist">
        <ul id="treeList"></ul>
    </div>

</div>

<script type="text/javascript" charset="utf-8">
var treeData = {{ JSON.stringify(treeData, null, 4) }};

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
</script>
</body>

</html>
