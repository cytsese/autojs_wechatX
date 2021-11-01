let FileChooserDialog = require("./file_chooser_dialog");
let Choose = {}
Choose.dir = "/sdcard/"
Choose.path = ""
Choose.callback = function(){}//在调用环境中定义，用来定义用户选择之后的操作
let w = build()
Choose.choose = function(){
    Choose.path = ""
    w = build()
    w.show()
}

function build(){
    let w = FileChooserDialog.build({
    title: '请选择目标文件',
    // 初始文件夹路径
    dir: Choose.dir,
    // 可选择的类型，file为文件，dir为文件夹
    canChoose: ["file","dir"],
    // 选择文件后的回调
    // 自动保存上次选择路径
    fileCallback: (filepath)=>{
        if(!filepath){return null}
        Choose.path = filepath
        Choose.dir = filepath
        if(files.isFile(filepath)){
            Choose.dir = filepath.replace(files.getName(filepath),"")
        }
        Choose.callback()
    }
})
    return w
}

module.exports = Choose

