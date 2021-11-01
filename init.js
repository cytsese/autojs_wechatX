


var imgs = ["file://./res/splashIcon.png",
    "http://pic1.win4000.com/mobile/2018-11-05/5bdff127e2e79.jpg",
    "https://b.zhutix.com/bizhi/colorful-geometry/3.png",
    "http://pic1.win4000.com/mobile/2020-08-04/5f291dac4a673.jpg",
    "http://pic1.win4000.com/mobile/2020-07-14/5f0d5f4a95c66.jpg"
    ]

let _func = require("./func.js")
init={}
// init.HotUpdate = HotUpdate
init.ProjectConfig = JSON.parse(files.read("./project.json"))
init.imgs = imgs
init.imgsrc = init.imgs[2]
init.textColor = "#FFFFFF"
init.bg = "#000000"
init.viewpagers=["首页","高级"]
//其他设置
// init.DeviceInfo = _func.getDeviceInfo()
init.软件说明 = files.read("describe.txt")
//界面函数
init.create_mainFrame=create_mainFrame
function create_mainFrame(){
    //setting()
    // init.HotUpdate(engines.myEngine())
    ui.statusBarColor(init.bg)    
    ui.layout(
        files.read("mainFrame.xml")
    )
    ui.toolbar.setTitle(init.ProjectConfig.name)
    createViews()
    binds()
    loadConfig()
}

//加载tab页面视图
function createViews(){
    if(init.DeviceInfo && init.DeviceInfo.release<7){
        ui.inflate(<text color="#FF1111" text="当前安卓版本过低，部分功能可能不受支持" gravity="center" />,ui.tab1,true)
    }
    ui.inflate(files.read("tab1.xml"),ui.tab1,true)
    //设置滑动页面的标题
    ui.viewpager.setTitles(init.viewpagers);
    //让滑动页面和标签栏联动
    ui.tabs.setupWithViewPager(ui.viewpager);
    ui.软件说明.setText("* "+files.read("./describe.txt").split("\n").join("\n* "))
    
}

//所有的事件绑定
function binds(){
    ui.chatQQ.on("click",()=>{_func.chatQQ("1148339518")})
    ui.start.on("click",start)
    // ui.设置话术.on("click",function(){app.editFile(ui.话术路径.text())})
    // ui.选择文件.on("click",Choose.choose)
    
    
    
    //创建选项菜单(右上角)
    ui.emitter.on("create_options_menu", menu=>{
        menu.add("强制更新");
        menu.add("关于");
    });
    //监听选项菜单点击
    ui.emitter.on("options_item_selected", (e, item)=>{
        switch(item.getTitle()){
            case "强制更新":
                _func.download("多闪X","./","./main.js")
                break;
            case "关于":
                alert("关于", "Auto.js界面模板 v1.0.0");
                break;
        }
        e.consumed = true;
    });
    activity.setSupportActionBar(ui.toolbar);



    //让工具栏左上角可以打开侧拉菜单
    ui.toolbar.setupWithDrawer(ui.drawer);

    ui.menu.setDataSource([
    {
        title: "选项",
        icon: "@drawable/ic_android_black_48dp"
    },
    {
        title: "退出",
        icon: "@drawable/ic_exit_to_app_black_48dp"
    }
    ]);

    ui.menu.on("item_click", item => {
        switch(item.title){
            case "退出":
                ui.finish();
                break;
        }
    })

    ui.acces.on("check", function (checked) {
        // 用户勾选无障碍服务的选项时，跳转到页面让用户去开启
        if (checked && auto.service == null) {
            app.startActivity({
                action: "android.settings.ACCESSIBILITY_SETTINGS"
                
            });
        }
        if (!checked && auto.service != null) {
            auto.service.disableSelf();
        }
    });

    // 当用户回到本界面时，resume事件会被触发
    ui.emitter.on("resume", function () {
        // 此时根据无障碍服务的开启情况，同步开关的状态
        ui.acces.checked = auto.service != null;
    });
    
    ui.window.on("check",function(checked){
            if(!auto.service){
                toast("请先开启无障碍服务")
                return false
            }
            if(!checked){return false}
            app.startActivity({
            packageName: "com.android.settings",
            className: "com.android.settings.Settings$AppDrawOverlaySettingsActivity",
            data: "package:" + auto.service.getPackageName().toString()
        });
    })

    ui.capture.on("check", function (checked) {
        // 屏幕截图权限
        if(!checked){return false}
        threads.start(function(){
            if(device.width>device.height){
                flag = false
            }else{
                flag = true
            }
            if(!requestScreenCapture(flag)){
                ui.capture.checked = false
            }
        })
    });
}


module.exports = init