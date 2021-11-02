/*热更新基于自身项目文件夹下的 project.json 文件，
  会对本项目文件下的脚本进行写入操作，谨慎调试！！*/

mainEngine = null
ProjectConfig = JSON.parse(files.read("project.json"))

url = "http://nbcyt.nat123.cc/"

function HotUpdate(engine){
    // '传入正在运行的engine,便于停止后重新运行'
    mainEngine = engine
    {
        return threads.start(newUpdate)
    }
    
}
//download("00000")

function newUpdate(){
    let url = 'http://139.155.179.177/'
    var ProjectName = ProjectConfig.name
    var ProjectVersion = ProjectConfig.versionCode
    var ProjectVersionName = ProjectConfig.versionName
    log("*****检查更新*****")
    log(ProjectName+":"+ProjectVersion)
    var data = {}
    data["cmd"] = "update"
    data["project_name"] = ProjectName
    data["sign"] = $crypto.digest(makeKey(data), "MD5")
    let r = {}
    try{r = http.post(url,data).body.json()}catch(e){console.error(e+"\nHotUpdate: Connect error");return null}
    console.log(r);
    var newVersion = r.update.version
    if(ProjectVersion>=newVersion){
        toastLog("当前已是最新版本")
        return
    }
    //toastLog("有新版本可更新："+newVersion)
    var download_url = r.update.download_url//压缩包下载地址
    var updateDocs = r.update.doc
    var dialog = dialogs.build({
        title: "版本更新 "+ProjectVersionName+"->"+r.update.version_name,
        content:"更新内容：\n"+ updateDocs,
        positive: "立即更新",
        negative: "强制更新"
    })
    function install_now(){
        dialog = dialogs.build({
           title: "正在更新...",
           progress: {
               max: 100,
               showMinMax: false
           },
           autoDismiss: false
        })
        dialog.show()
        var thread = threads.start(function(){
            download_unzip(download_url)
        })
        var speed = 1
        var dialogInterval = setInterval(()=>{
            dialog.setProgress(dialog.getProgress()+speed);
            if(!thread.isAlive()){
                clearInterval(dialogInterval);
                dialog.dismiss();
                dialog = null;
                toast("更新成功");
                ProjectConfig.versionCode = newVersion
                ProjectConfig.versionName = r.update.version_name
                files.write("project.json",JSON.stringify(ProjectConfig))
            }
        }, 50)
    }
    dialog.on("positive", install_now)
    dialog.on("negative", install_now)//强制更新
    dialog.show()
}

function download_unzip(url){
    //需要解析蓝奏云的地址
    let r = http.post('http://139.155.179.177/',{
        cmd:'get_downloadUrl',
        url:url
    }).body.json().download_url
    url = JSON.parse(r).info
    log('parse url:'+url)
    ZipFile = http.get(url).body.bytes()
    files.writeBytes('update_pack.zip',ZipFile)
    $zip.unzip('update_pack.zip', './');
    let dialog = dialogs.build({
        title:"更新完成",
        content:"是否重新加载？",
        positive: "是",
        negative: "稍后手动重启"
    })
    dialog.on("positive", ()=>{
        mainEngine.forceStop()
        execution = engines.execScriptFile(ProjectConfig.main); 
    })
    dialog.show()
}

function makeKey(data){
    var key = new Date().getTime()
    for(let i in data){
        key += data[i]
    }
    //return key;
    return $crypto.digest(key,"MD5")
}


module.exports = HotUpdate