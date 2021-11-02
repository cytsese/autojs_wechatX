
var func={}

func.finger = function(cmd,widget0,widget1,duration){
  function getposition(widget){
    let x=null;let y=null;
    try{
        x = widget.bounds().centerX()
        y = widget.bounds().centerY()
    }catch(e){
        if(widget.x){
           x = widget.x
           y = widget.y
        }else if(widget[0]){
           x = widget[0]
           y = widget[1]
        }
    }
    let p = [x,y]
    return p
  }
    duration=duration||1000
    widget1 = widget1||widget0
    let p0 = getposition(widget0)
    let p1 = getposition(widget1)
    let x0=p0[0];let y0=p0[1];
    let x1=p1[0];let y1=p1[1];
    switch(cmd){
        case "click":
            click(x0,y0)
            break
        case "press":
            press(x0,y0,duration)
            break
        case "swipe":
            swipe(x0,y0,x1,y1,duration)
            break
    }
    return null
}

func.similarity2 = function(s, t) {
    '返回字符串相似度'
    function Minimum(a, b, c) {
        return a < b ? (a < c ? a : c) : (b < c ? b : c);
    }
    var l = s.length > t.length ? s.length : t.length;
    var n = s.length,
        m = t.length,
        d = [];
    var i, j, s_i, t_j, cost;
    if (n == 0) return m;
    if (m == 0) return n;
    for (i = 0; i <= n; i++) {
        d[i] = [];
        d[i][0] = i;
    }
    for (j = 0; j <= m; j++) {
        d[0][j] = j;
    }
    for (i = 1; i <= n; i++) {
        s_i = s.charAt(i - 1);
        for (j = 1; j <= m; j++) {
            t_j = t.charAt(j - 1);
            if (s_i == t_j) {
                cost = 0;
            } else {
                cost = 1;
            }
            d[i][j] = Minimum(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
        }
    }
    d = d[n][m];
    return (1 - d / l).toFixed(4);
}

func.getCode_lz = function(img,captchaType,username,password) {
    // '联众识别接口，r.code = 0成功'
    username = username || Configs.code_username
    password = password || Configs.code_pwd
    captchaType = captchaType || 1013
    http.__okhttp__.setTimeout(3e4);
    var img64 = images.toBase64(img, format = "png")
    try {
        var n = http.postJson("https://v2-api.jsdama.com/upload", {
            softwareId: 25551,
            softwareSecret: "kfvkeIFVNpPGYjCVxLMBFwjnGEdkZUjbXwxsdxIH",
            username: username,
            password: password,
            captchaData: img64,
            captchaType: captchaType,
            // captchaMinLength: 4,
            // captchaMaxLength: 6,
            workerTipsId: 0
        }
        // , {
        //     headers: {
        //         "User-Agent": "Mozilla/5.0 (Linux; Android " + i + "; " + c + " Build/" + s + "; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 Mobile Safari/537.36",
        //     }
        // }
        );
    } catch (e) {
        return {
            code: "-1",
            msg: "网络链接超时...",
            data: {}
        };
    }
    return n.body.json();
}
func.changeColor = function(img, originColor1,originColor2, newColor) {
    // originColor is #000000 auto trans to int; newColor is same
    originColor1 = colors.parseColor(originColor1)
    originColor2 = colors.parseColor(originColor2)
    r_min = colors.red(originColor1);
    g_min = colors.green(originColor1);
    b_min = colors.blue(originColor1);
    r_max = colors.red(originColor2);
    g_max = colors.green(originColor2);
    b_max = colors.blue(originColor2);
    var bitmap = img.bitmap
    for (var y = 0; y < bitmap.height; ++y) {
        for (var x = 0; x < bitmap.width; ++x) {
            var c = bitmap.getPixel(x, y);
            r = colors.red(c);
            g = colors.green(c);
            b = colors.blue(c);
            if(((r>=r_min) && (g>=g_min) && (b >= b_min)) && ((r<=r_max) && (g<=g_max) && (b <= b_max))){
                bitmap.setPixel(x, y, colors.parseColor(newColor));
            }
            // if ((c >= originColor1) && (c <= originColor2)) {
            //     // bitmap.setPixel(x, y, newColor);
            //     bitmap.setPixel(x, y, colors.parseColor(newColor));
            // }

        }
    }
    return images.copy(img) ;
}
func.baiduOCR = function(img, is位置,promise){
    var imag64 = images.toBase64(img, "jpg", 100);
    //本代码。key值，属于，大维万，所有。每天可用1000次。
    var API_Key = "GlGNe6G5c1jkfkGVDqLVmOLl";
    var Secret_Key = "NY2foV0zKIaiZf6v1c7W5ZmnutqE3WAb";
    var getTokenUrl = "https://aip.baidubce.com/oauth/2.0/token";
    //token获取地址。
    var token_Res = http.post(getTokenUrl, {
        grant_type: "client_credentials",
        client_id: API_Key,
        client_secret: Secret_Key,
    });
    var token = token_Res.body.json().access_token;
    //log(token);
    var ocrUrl1 = "https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic"; //每天可用5000次。
    //文字识别。
    var ocrUrl2 = "https://aip.baidubce.com/rest/2.0/ocr/v1/general"; //每天可用500次。
    //含位置信息。
    var ocrUrl3 = "https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic"; //每天可用500次。
    //含位置信息。
    var ocrUrl = ocrUrl1;
    if (is位置) {
        ocrUrl = ocrUrl2;
    };
    
    var ocr_Res = http.post(ocrUrl, {
        headers: {
            "Content - Type": "application/x-www-form-urlencoded"
        },
        access_token: token,
        image: imag64,
    });

    var json = ocr_Res.body.json();
    if((!json.words_result)&&promise){
        log('QPS限制导致请求失败，重试至成功')
        while(!json.words_result){
            sleep(500)
            ocr_Res = http.post(ocrUrl, {
                headers: {
                    "Content - Type": "application/x-www-form-urlencoded"
                },
                access_token: token,
                image: imag64,
            });
            json = ocr_Res.body.json();
        }
    }
    return json;
}
func.download = function(ProjectName,unzipath,mainScriptpath){
    mainScriptpath = mainScriptpath || null
    unzipath = unzipath || "./data/"
    var url = "http://1.15.44.26:8003/hotupdate.php?cmd=get_download_url&ProjectName="+ProjectName
    var r = http.get(url).body.json()
    if(!r.download.status){toastLog("获取失败，请联系作者处理");return false}
    var thread = threads.start(function(){
        "正在获取数据..."
        files.writeBytes("./data.zip",http.get(r.download.info).body.bytes())
        $zip.unzip('./data.zip', unzipath);
        toast("资源获取成功");
    })
    while(thread.isAlive()){sleep(100)}
    if(mainScriptpath){return engines.execScriptFile(mainScriptpath)}
}

//有顺序要求，基本的放前面，后面的会调用前面
//默认使用func.log输出日志，因此需要在调用环境中先创建floatylog，否则报错
func.tuse = {}
func.tuse.ocr = function(img,box,Score){
    //box:区域[x1,y1,x2,y2] Score:过滤置信度
    //返回结果集r:[{"text":text,"point":[x,y]}...]
    
    try{ocr}catch(e){
        try{ocr = $plugins.load("com.hraps.ocr")}catch(e){
            func.log("ocr插件未安装")
            return null
        }
    }
    box = box || [0,0,device.width,device.height]
    img = img || images.clip(images.captureScreen(),box[0],box[1],box[2]-box[0],box[3]-box[1])
    Score = Score || 0.5
    results = ocr.detect(img.getBitmap(),1)//识别图片
    results = ocr.filterScore(results,Score-0.2,Score,Score)//识别结果过滤
    img.recycle()
    let r = []
    for(var i=0;i<results.size();i++){
        let re = results.get(i)
        let frame = re.frame.toArray()
        //取中心坐标
        let point = [parseInt(0.5*(frame[0]+frame[6])),parseInt(0.5*frame[1]+frame[7])]
        r.push({"text":re.text,"point":point})
    }
    return r
}
func.tuse.click = function(pointName,clickdelay){
    clickdelay = clickdelay || 500
    func.finger("click",data.points[pointName])
    func.log("click:"+pointName)
    sleep(clickdelay)
}
func.tuse.findPic = function(box,pic,th,img){
    //box：找图区域，坐上坐标和右下坐标；注意截图方向
    //img: 大图，如果不传入此参数讲自动截屏
    th = th || 0.8
    box = box || [0,0]
    img = img || captureScreen()
    if(box[3]){box = [box[0], box[1],box[2]-box[0],box[3]-box[1]]}else{box = [0,0]}
    var r = findImage(img, pic, {
        region: box,
        threshold: th
    });
    if(r){
        // toast("找到了: " + r);
    }else{
        // toast("没有找到");
    }
    return r
}
func.tuse.isPic = function(PicName,th,img,no_box){
    //判断是否存在某个图片，返回findPic找到的坐标
    //PicName:data.json中定义的特征名，一般等同于图片名
    th = th || 0.8
    img = img || captureScreen()
    let path = data.features[PicName]["pic"]
    let box = data.features[PicName]["box"]
    let pic = images.read(path)
    if(no_box){box = [0,0]}
    let r = func.tuse.findPic(box,pic,th,img)
    pic.recycle()
    // r && func.log("FindPic"+PicName)
    // !r && func.log("NotFindPic"+PicName)
    return r
}
func.tuse.clickPic = function(PicName,th,clickdelay){
    th = th || 0.8
    let r = func.tuse.isPic(PicName,th)
    if(!r){
        sleep(500)
        r = func.tuse.isPic(PicName,th)
        if(!r){return null}
    }//找2次，默认延时500ms
    clickdelay = clickdelay || 500
    func.finger("click", r)
    sleep(clickdelay)
    return true
}
func.tuse.isPics = function(PicList,th){
    //传入图片名列表，截图一次，返回出现的图片名列表
    //如果不带参数，默认检测所有特征
    PicList = PicList || Object.keys(data.features)
    th = th || 0.7
    let PicName = ""
    let r = []
    let img = captureScreen()
    for(let i in PicList){
        PicName = PicList[i]
        if(func.tuse.isPic(PicName,th,img)){
            r.push(PicName)
        }
    }
    return r
}
func.tuse.waitPic = function(PicName,th,waitime,sleeptime){
    //等待某个图片出现，返回true或false
    //PicName:图片名(从data中读取)，必须存放于./pic文件夹内，且与data内的box（b）区域同名
    //waitime: 等待时间ms默认12秒；sleeptime：检测间隔ms
    waitime = waitime || 12000
    th = th || 0.8
    sleeptime = sleeptime || 1000
    let t = 0
    while(t<waitime){
        r = func.tuse.isPic(PicName,th)
        if(r){return true}else{
            // func.log("Wiat Pic:"+PicName)
            t = t+sleeptime
            sleep(sleeptime)
        }
    }
    func.log("特征未出现："+PicName)
    return false
    
}
func.tuse.waitPIClick = function(PicName,pointName,th,wtime,stime,clickdelay){
    //等待图片出现并点击某个点,默认点击图片
    wtime = wtime || 3000
    stime = stime || 500
    let r = func.tuse.waitPic(PicName,th,wtime,stime)
    if(r){
        if(pointName){func.tuse.click(pointName,clickdelay)}
        else{func.tuse.clickPic(PicName)}
        return true
    }
    return false
}

func.tuse.findFeature = function(box,Feature,th){
    //Featrue：格式为["000000","-1|66|193A3F,2|129|000000"]
    th = th || 0.8
    box = box || [0,0]
    let firstColor = "#" + Feature[0]
    let temp = Feature[1].split(",")
    let tmp = []
    let secondColor = []//组成这种形式：[[10, 20, "#ffffff"], [30, 40, "#000000"]
    if(box[3]){box = [box[0], box[1],box[2]-box[0],box[3]-box[1]]}else{box = [0,0]}
    for(let i in temp){
        tmp = temp[i].split("|")
        tmp[0] = Number(tmp[0])
        tmp[1] = Number(tmp[1])
        tmp[2] = '#' + tmp[2]
        secondColor.push(tmp)
    }
    var r = images.findMultiColors(captureScreen(),firstColor,secondColor, {
        region: box,
        threshold: th
    });
    return r
}
func.tuse.isFeature = function(FeatureName,th){
    //判断是否存在某个特征，返回true或false
    //feature：多点找色特征（按键精灵格式）
    th = th || 0.8
    let box = data.b[FeatureName]
    let feature = data.feature[FeatureName]
    let r = func.tuse.findFeature(box,feature,th)
    log("findFeature"+FeatureName+":"+r)
    if(r){return true}else{return false}
}
func.tuse.isFeatures = function(FeatureList,th){
    //传入特征名列表，截图一次，返回出现的特征名列表
    FeatureList = FeatureList || Object.keys(data.feature)
    th = th || 0.7
    let r = []
    let img = captureScreen()
    for(let i in FeatureList){
        FeatureName = FeatureList[i]
        if(func.tuse.isFeature(FeatureName,th,img)){
            r.push(FeatureName)
        }
    }
    return r
}
func.tuse.waitFeature = function(FeatureName,th,waitime,sleeptime){
    //等待某个特征出现，返回true或false
    //waitime: 等待时间ms默认12秒；sleeptime：检测间隔ms
    waitime = waitime || 12000
    th = th || 0.8
    sleeptime = sleeptime || 1000
    let t = 0
    let r = null
    while(t<waitime){
        r = func.tuse.isFeature(FeatureName,th)
        if(r){
            return true
        }else{
            t = t+sleeptime
            sleep(sleeptime)
        }
    }
    func.log("Pic not showup")
    return false
}
func.tuse.waitFeatureClick = function(FeatureName,pointName,th,wtime,stime,clickdelay){
    //等待图片出现并点击某个点
    wtime = wtime || 5000
    stime = stime || 500
    let r = func.tuse.waitFeature(FeatureName,th,wtime,stime)
    if(r){
        func.tuse.click(pointName,clickdelay)
        return true
    }
    return false
}

func.arrSub = arrSub
function arrSub(a, b) {
    if (Array.isArray(a) && Array.isArray(b)) {
        if(a.length<b.length){[a,b]=[b,a]}
        return a.filter(i => !(b.indexOf(i)+1))
    }
    throw new Error('arrSub(): Wrong Param Type')
}

func.createControl = function(thread_function,flag){
    flag = flag || "function"
    if(flag=="file"){var filepath = thread_function}
    //传入线程开始的函数，用于控制
    // if(typeof thread_function != "function"){
    //     toastLog("createControl：参数错误，必须是function")
    //     return false
    // }
  threads.start(function(){
    func.ispause = true
    var thread = null
    var engine = null
    //记录按键被按下时的触摸坐标
    var x = 0, y = 0;
    //记录按键被按下时的悬浮窗位置
    var windowX, windowY;
    //记录按键被按下的时间以便判断长按等动作
    var downTime;
    var window = floaty.window(
        <vertical id="floaty"  gravity="center">
            <card w="55" h="38" cardCornerRadius="15dp" cardElevation="1dp">
                <View bg="#99010101" w="55" h="38"/>
                <text margin="8" id="ok" gravity="center" color="#EECa00" size="16sp" text="开始"/>
            </card>
        </vertical>
    );
    window.floaty.setOnTouchListener(function(view, event){
      switch(event.getAction()){
        case event.ACTION_DOWN:
            x = event.getRawX();
            y = event.getRawY();
            windowX = window.getX();
            windowY = window.getY();
            downTime = new Date().getTime();
            return true;
        case event.ACTION_MOVE:
            //移动手指时调整悬浮窗位置
            window.setPosition(windowX + (event.getRawX() - x),
                windowY + (event.getRawY() - y));
            //如果按下的时间超过1.5秒判断为长按，退出脚本
            if(new Date().getTime() - downTime > 1500){
                exit();
            }
            return true;
        case event.ACTION_UP:
            //手指弹起时如果偏移很小则判断为点击
            if(Math.abs(event.getRawY() - y) < 5 && Math.abs(event.getRawX() - x) < 5){
                onClick();
            }
            return true;
      }
      return true;
    })
    window.setPosition(10,device.height*0.1)
    window.exitOnClose();
    //点按时控制线程的中断
    function onClick(){
        func.ispause = !func.ispause
        if(func.ispause){
            window.ok.setText("开始")
            if(flag=="function"){thread.interrupt();toastLog("任务已中断")}
            if(flag=="file"){engine.getEngine().forceStop();toastLog("任务已中断")}
        }
        else{
            window.ok.setText("停止")
            if(flag=="function"){thread = threads.start(thread_function)}
            if(flag=="file"){engine = engines.execScriptFile(thread_function)}
        }
        window.disableFocus();
    }
    setInterval(()=>{}, 1000)
    func.Control = window
  })
}

func.create_floatyLog = floatyLogInit
function floatyLogInit(linesCount, x, y, islog) {
    if (typeof linesCount != 'number') linesCount = 6;
    if (typeof x != 'number') x = 0;
    if (typeof y != 'number') y = 0;
    if (typeof islog != 'boolean') islog = true;

    w = floaty.rawWindow(
        <horizontal id='move' background='#55000000' paddingLeft="3" paddingRight="3" w="*">
            <button id='log' textSize="12dp" textColor="#FF11FF00" style="Widget/AppCompat.Button.Borderless" text='[点击开始按钮开始运行]' textStyle='bold'
                layout_gravity="right" layout_weight='5' layout_width="wrap_content" layout_height="wrap_content" />
        </horizontal>
    );
    w.setTouchable(false);
    ui.run(() => { w.setPosition(x, y) })

    let nowlogArr = [];
    Log = function () {
        cs = new Date().getTime();
        let s = '[' + dateFormat(new Date(), "hh:mm:ss") + '] '
        for (let param of arguments) s += param + ' ';
        nowlogArr.push(s);

        if (nowlogArr.length > linesCount) nowlogArr.shift();
        let printContent = nowlogArr.join('\n');
        ui.run(() => { w.log.text(printContent); })
        if (islog) log(s);
    }
    clear = function(){
        nowlogArr = []
        ui.run(() => { w.log.text(""); })
    }

    floatyShow = function (x, y) {
        let _x = x || 0
        let _y = y || 10
        ui.run(() => { w.setPosition(_x, _y) })
    }

    floatyHide = function () {
        ui.run(() => { w.setPosition(3000, 3000) })
    }


    function dateFormat(date, fmt) {
        let o = {
            "M+": date.getMonth() + 1,
            "d+": date.getDate(),
            "h+": date.getHours(),
            "m+": date.getMinutes(),
            "s+": date.getSeconds(),
            "S": date.getMilliseconds()
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }

        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    }
    func.Log = Log
    func.log = Log
    func.clear = clear
    func.LogShow = floatyShow
    func.LogHide = floatyHide
}

//设置试用时间，适用于需要长时间运行的项目
func.entertainment = function(t){
    threads.start(function(){
        sleep(3000)
        toastLog("试用时间剩余 "+t/60000 +"分钟")
        sleep(t-3000)
        toastLog("3秒后试用结束")
        sleep(1000)
        ui.finish()
        exit()
    })
}

func.datetime = function(timestamp){
    if(timestamp){
        var date = new Date(timestamp)//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    }else{
        var date = new Date()
    }
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1):date.getMonth()+1) + '-';
    var D = (date.getDate()< 10 ? '0'+date.getDate():date.getDate())+ ' ';
    var h = (date.getHours() < 10 ? '0'+date.getHours():date.getHours())+ ':';
    var m = (date.getMinutes() < 10 ? '0'+date.getMinutes():date.getMinutes()) + ':';
    var s = date.getSeconds() < 10 ? '0'+date.getSeconds():date.getSeconds();
    return Y+M+D+h+m+s;
}
//设置使用期限
func.effect_date = function(date,mainloop){
    //date = "2020/8/16 10:00:00"
  threads.start(function(){
    sleep(3000)
    toastLog("有效期至 "+date)
    date = (new Date(date)).getTime()
    use_time = date-(new Date()).getTime()
    if(use_time>0){
        sleep(use_time)
    }
    toastLog("试用期已过，请联系作者")
    sleep(1000)
    threads.shutDownAll()
    exit()
  })
}

func.login = function(form){
    if(form.delay){toastLog("请勿频繁操作");return false}
    if(form.username.length<5 || form.username.length>12){
        ui.username.setError("请输入正确的账号")
    }else if(!done(form.username)){
        ui.username.setError("账号中只能有英文和数字")
    }else{
        var UserInfo = {}
        let url = "https://hn216.api.yesapi.cn/"
        form.s="App.User.LoginExt"
        form.app_key="E7F29632831737529B6D60939B48E19A"
        form.is_allow_many="0"
        http.postJson(url,form,null,function(r){
            var r_data={}
            try{r_data = r.body.json()}
            catch(e){toastLog(e);return false}
            if(r_data.ret!=200){toastLog("请求错误");return false}
            if(r_data.data.err_code==1 || r_data.data.err_code==2){toastLog("账号或密码错误");return false}
            if(r_data.data.err_code==0){
                toastLog("登录成功，正在跳转")
                UserInfo=r_data.data
                log(UserInfo)
            }else{
                toastLog(r_data.data.err_msg)
                return false
            }
        })
        form.delay=true
        setTimeout(()=>{
            form.delay=null
        },5000)
        var IntervalId = setInterval(()=>{
            if(UserInfo.token){
                init.create_mainFrame()
                clearInterval(IntervalId)
            }
        },1000)
    }
    
}

func.register = function(form){
    if(form.delay){toastLog("请勿频繁操作");return false}
    if(form.username.length<5 || form.username.length>12){
        ui.username.setError("账号应为5-12位")
    }else if(!done(form.username)){
        ui.username.setError("账号中只能有英文和数字")
    }else if(!done(form.password)){
        ui.password.setError("密码中只能有英文和数字")
    }else if(!check_email(form.ext_info.email)){
        ui.email.setError("邮箱格式错误")
    }else if(form.ext_info.qq.length<4||parseInt(form.ext_info.qq)<10000){
        ui.qq.setError("请输入正确的QQ号")
    }else{
        let url = "https://hn216.api.yesapi.cn/"
        form.s="App.User.RegisterExt"
        form.app_key="E7F29632831737529B6D60939B48E19A"
        http.postJson(url,form,null,function(r){
            var r_data={}
            try{r_data = r.body.json()}
            catch(e){toastLog(e);return false}
            if(r_data.ret!=200){toastLog("请求错误");return false}
            if(r_data.data.err_code==1){toastLog("该账号已被注册");return false}
            if(r_data.data.err_code==0){
                toastLog("注册成功，正在登录")
                form.delay=null
                func.login(form)
            }
        })
        form.delay=true
        setTimeout(()=>{
            form.delay=null
        },5000)
    }
}

//青云智能聊天机器人
function reply(msg,key,appid){
    key = key||"free"
    appid = appid||"0"
    let url = "http://api.qingyunke.com/api.php?"
    let data={}
    data.key=key
    data.appid=appid
    data.msg=encodeURIComponent(msg)
    data = post2get(data)
    url+=data
    try{
        data = http.get(url).body.json()
    }catch(e){
        log(e)
        log("reply msg:"+msg+" 解析错误")
        return ""
    }
    return data.msg
}

//http请求的json对象转换为&拼接的字符串
func.post2get = post2get
function post2get(json){
    let attr = []
    for(let i in json){
        attr.push(i+"="+json[i])
    }
    return attr.join("&")
}

func.getDeviceInfo = function(){
    let DeviceInfo = {}
    DeviceInfo.IMEI=device.getIMEI()
    DeviceInfo.AndroidID = device.getAndroidId()
    DeviceInfo.release = device.release.split(".")[0]
    return DeviceInfo
}

func.call = function(phone){
    let i = app.intent({ action: "DIAL",data: "tel:"+phone });
    app.startActivity(i)
}

func.chatQQ = function(qq){
    qq = qq||"1148339518";
    app.startActivity({ 
    action: "android.intent.action.VIEW", 
    data:"mqq://im/chat?chat_type=wpa&version=1&src_type=web&uin=" + qq, 
    packageName: "com.tencent.mobileqq", 
    });
}

//判断字符串是否只由英文和数字组成
function done(input, LengthBegin, LengthEnd) { 
  LengthBegin=LengthBegin||0
  LengthEnd= LengthEnd||input.length
  var pattern = '^[0-9a-zA-z]{' + LengthBegin+ ',' + LengthEnd+ '}$'; 
  var regex = new RegExp(pattern); 
  if (input.match(regex)) { 
    return true; 
  } else { 
    return false; 
  } 
}
//验证邮箱格式
function check_email(input){
    var strRegex = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/
    if(!strRegex.test(input)){
        return false;
    }
    return true
}

func.Coder = {
  key : "",
  text : "",
  encryptText:"",
  decryptText:"",
  encrypt : function(key){
      key = this.key || key
      key = $crypto.digest(key,"MD5")
      let j = 0
      let out = ""
      let char1 = 0
      let char2 = 0
      for(let i in this.text){
          if(j==key.length){j = 0}
          char1 = this.text.charCodeAt(i)
          char2 = key.charCodeAt(j)
          out = (char1^char2)
          this.encryptText += out+" "
          j += 1
      }
      return this.encryptText
  },
  decrypt : function(key){
      key = this.key || key
      key = $crypto.digest(key,"MD5")
      let text = this.encryptText || this.text
      text = text.split(" ")
      let j = 0
      let out = ""
      let char1 = 0
      let char2 = 0
      for(let i in this.text){
          if(j==key.length){j = 0}
          char1 = text[i]
          char2 = key.charCodeAt(j)
          out = String.fromCharCode(char1^char2)
          this.decryptText += out
          j += 1
      }
      return this.decryptText
  }
}

module.exports = func