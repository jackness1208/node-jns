<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="HandheldFriendly" content="true">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=0">
<title>mini IM</title>
<script src="http://<%= config.serverAdress%>:<%= config.tool.im.websocket.port%>/socket.io/socket.io.js"></script>
<script>
!function(){
    var docEl = document.documentElement,
        dpr = window.devicePixelRatio || 1,
        fixDpr = window.screen.width === docEl.clientWidth ? dpr : 1,

        screenWidth = window.screen.width * fixDpr,
        screenHeight = window.screen.height * fixDpr,
        clientWidth = screenWidth > screenHeight? screenHeight: screenWidth,
        clientHeight = screenWidth > screenHeight? screenWidth: screenHeight,
        fontEl = document.createElement('style'), 
        metaEl = document.querySelector('meta[name="viewport"]'), 
        rem = clientWidth / 10, 
        vrem = clientHeight / 10,
        scale = 1 / dpr; // 设置viewport，进行缩放，达到高清效果 

    metaEl.setAttribute('content', [
        'width=' + clientWidth,
        'initial-scale=' + scale,
        'maximum-scale='+ scale
    ].join(','));
    

    docEl.setAttribute('data-dpr', dpr); // 动态写入样式 
    docEl.firstElementChild.appendChild(fontEl); 

    // 给js调用的，某一dpr下rem和px之间的转换函数 
    fontEl.innerHTML = [
        'html{font-size:' + rem + 'px!important;}',
        '@media screen and (min-width: '+ clientHeight +'px){',
            'html{font-size:'+ vrem +'px!important;}',
        '}',
    ].join('');

    
}();
</script>
<link rel="stylesheet" href="<%= config.domain %>tool/css/im/im.css" type="text/css" charset="utf-8">
</head>
<body>
    <div class="im-area">
        <div class="im-head">
            <h3 class="h-tl">Mini IM</h3>
        </div>
        <!-- 广场 -->
        <div class="im-square">
            
        </div>

        <!-- 工具区域 -->
        <div class="im-tool">

        </div>

        <!-- 姓名区域 -->
        <div class="im-namebox">
            <input type="text" class="im-namebox-txt" id="imNameTxt" value="" placeholder="昵称" />
        </div>

        <!-- 对话框区域 -->
        <div class="im-editor">
            <textarea class="im-editor-txt" id="imEditor"></textarea>
        </div>

        <!-- 按钮区域 -->
        <div class="im-btns">
            <input class="server-trans-btn" type="button" id="imSendBtn" value="发送" />
        </div>

    </div>

<script type="text-javascript" src="<%= config.domain %>tool/js/im.js"></script>
</body>

</html>


