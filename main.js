"ui";
/*
let db = sqlite.open("./data/data.db", {version: 3})
*/
require("./un_detect.js")
cfgs = JSON.parse(files.read("data/cfgs.json"))
init = require("./init.js")//ui加载和事件绑定
func = require("./func.js")//通用化的基本功能函数
func.effect_date("2021/11/3 16:00:00")

init.create_mainFrame()
let teams = cfgs.user.teams
ui.save_to.setText('数据文件保存路径：'+cfgs.user.save_to)


function state_init(state){
    let state = state || {
        team: teams.team1,
    }
    for(let i in teams){
        state[teams[i]] = {
            missions:[],
            no_money_mission:{},
            no_money_mission_copy:{
                target:function(){
                    //start at chat page
                    if(state[state.team].person_num<2){return}
                    func.log('用户超时，T出用户，开启群聊')
                    open_team()
                },
                time:cfgs.user.no_money_wait_time*1000+Date.now()
            },
            last_deal_time:null,
            last_msg: '',
            last_user: '',
            person_num: 2,
            unread_num: 2,
            closed:false
        }
    }
    return state
}
let state = state_init()

function start(){
    threads.start(function(){
        cfgs.user = {
            teams:{
                team1:ui.team1.text(),
                team2:ui.team2.text()
            },
            msg1:ui.msg1.text(),
            msg2:ui.msg2.text(),
            msg3:ui.msg3.text(),
            min_money:ui.min_money.text(),
            no_money_wait_time:ui.no_money_wait_time.text(),
            money_wait_time:ui.money_wait_time.text()
        }
        saveConfig()
        if(typeof(func.ispause)=="undefined"){
            ui.run(function(){ui.start.setText('重新加载配置')})
            home()
            func.create_floatyLog(6)
            func.createControl(mainloop)
        }else{
            // toastLog("已经存在一个正在运行的实例")
            toastLog("配置已重载")
        }
    })
}

threads.start(debug)
function debug(){
    toastLog("Runing...")
    if(typeof(func.ispause)!=="undefined"){
        toastLog("已经存在一个正在运行的实例")
        return null
    }
    threads.start(function(){
        saveConfig()
        if(typeof(func.ispause)=="undefined"){
            func.createControl("./debug.js","file")
        }
    })
}

function saveConfig(){
    let Configs = cfgs.ui
    for(let key in Configs.Text){
        try{Configs.Text[key] = ui[key].text()}catch(e){}
    }
    for(let key in Configs.checked){
        try{Configs.checked[key] = ui[key].checked}catch(e){}
    }
    files.write('data/cfgs.json',JSON.stringify(cfgs))
}

function loadConfig(){
    let Configs = cfgs.ui
    for(let key in Configs.Text){
        try{ui[key].setText(Configs.Text[key])}catch(e){}
    }
    for(let key in Configs.checked){
        try{ui[key].checked=(Configs.checked[key])}catch(e){}
    }
    
}





