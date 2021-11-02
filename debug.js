require("./un_detect.js")
cfgs = JSON.parse(files.read("data/cfgs.json"))
func = require("./func.js")
func.create_floatyLog(6)
let teams = cfgs.user.teams
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

mainloop()

function mainloop(){
    func.log('开始运行')
    /*
    chat页面完成操作后尽量不停留，所有的空余时间应当在聊天界面外的主消息界面监测
    */ 
    app.launch("com.tencent.wework")
    let newmsg = wait_newmsg()
    while(1){
        chat(newmsg.team_wid,newmsg.teamname)
        msg_wids = get_msg()
        msg_deal(msg_wids)
        page_back()
        sleep(500)
        newmsg = wait_newmsg()
    }
    
}

function msg_deal(msg_wids){
    let e1 = user_msg_deal(msg_wids.user_msg_wid)
    let e2 = sys_msg_deal(msg_wids.sys_msg_wid)
    state[state.team].last_deal_time = Date.now()
    if(state[state.team].no_money_mission.target){
        state[state.team].no_money_mission = state[state.team].no_money_mission_copy
    }
    if(e1 || e2){
        func.log('计时器[用户超时] 已刷新')
        state[state.team].no_money_mission.time = cfgs.user.no_money_wait_time*1000+Date.now()
    }else{
        func.log('计时器[用户超时] 运行中')
        // state[state.team].no_money_mission.time = cfgs.user.no_money_wait_time*1000+Date.now()
    }
    func.log('消息处理完毕，返回监控')
}
function user_msg_deal(user_msg_wid){
    func.log('user_msg_deal')
    let is_effect = false
    let msg_data = {
        team:state.team,
        user_name:'',
        vcode:'',
        money:'',
        msg:''
    }
    for(let i in user_msg_wid){
        state[state.team].last_deal_time = Date.now()
        msg_data.user_name = user_msg_wid[i].parent().parent().child(0).child(0).text()
        if(user_msg_wid[i].childCount()==4){
            is_effect = true
            func.log('检测到用户红包')
            msg_data.msg = '红包'
            msg_data.vcode = ''
            msg_data.money = get_money(user_msg_wid[i])
            func.log('红包已领取，金额：'+msg_data.money)
            if(msg_data.money<cfgs.user.min_money){
                func.log('金额小于阈值，T出用户')
                open_team()
                sleep(5000)
            }else{
                func.log('等待 '+cfgs.user.money_wait_time+'s 后发送信息3，并T出用户')
                state[state.team].missions = [{
                    target:function(){
                        send_msg(cfgs.user.msg3)
                        open_team()
                    },
                    time:1000*cfgs.user.money_wait_time + Date.now()
                }]
                func.log(state[state.team].missions.toString())
            }
        }else{
            func.log('检测到用户消息')
            msg_data.msg = user_msg_wid[i].child(0).child(0).child(0).child(0).text()
            if(get_vcode(msg_data.msg)){
                is_effect = true
                msg_data.vcode = msg_data.msg
                func.log('收到验证码，发送信息2')
                send_msg(cfgs.user.msg2)
            }else{
                func.log('无效的用户消息')
                msg_data.vcode = ''
            }
            msg_data.money = ''
        }
        save_data(msg_data)
    }
    return is_effect
}
function sys_msg_deal(sys_msg_wid){
    // 对用户加群做出处理
    let is_effect = false
    let msg_data = {
        team:state.team,
        user_name:'',
        vcode:'',
        money:'',
        msg:''
    }
    func.log('sys_msg_deal')
    for(let i in sys_msg_wid){
        state[state.team].last_deal_time = Date.now()
        msg_data.msg = sys_msg_wid[i].findOne(className("android.widget.TextView")).text()
        msg_data.user_name = '系统消息'
        msg_data.vcode = ''
        msg_data.money = ''
        save_data(msg_data)
        if(is_join(msg_data.msg)){
            is_effect = true
            func.log('检测到新用户加入')
            state[state.team].person_num++
            func.log('准备关闭群聊')
            close_team()
            func.log('群聊已关闭，发送信息1')
            send_msg(cfgs.user.msg1)
        }
    }
    return sys_msg_wid.length
}
function page_back(){
    let wid = null
    if(['com.tencent.wework.msg.controller.PersonalModeGroupManagerActivity',
    'com.tencent.wework.msg.controller.PersonalModeGroupSettingActivity'].indexOf(currentActivity())+1){
        wid = clickable(true).className("android.widget.TextView").depth(1+8).findOne()
    }else{
        // com.tencent.wework.msg.controller.ExternalGroupMessageListActivity
        // com.tencent.wework.msg.controller.PersonalModeGroupMemberActivity
        wid = clickable(true).className("android.widget.TextView").depth(1+9).findOne()
    }
    wid.click()
    sleep(200)
}
function close_team(){
    func.log('close team')
    team_card()
    text('群管理').findOne().parent().parent().parent().parent().click()
    let wid = text("群聊邀请确认").findOne().parent().parent().parent().findOne(clickable(true))
    wid.click()
    sleep(100)
    page_back()//now is team_card
    out_person(2)//关群后T人至2人
    page_back()
    func.log('计时器已激活，用户超时将被踢出')
    state[state.team].no_money_mission = state[state.team].no_money_mission_copy
    state[state.team].no_money_mission.time = 1000*cfgs.user.no_money_wait_time + Date.now()
}
function open_team(){
    func.log('open team')
    team_card()
    out_person(1)//T人至1人后开群
    text('群管理').findOne().parent().parent().parent().parent().click()
    let wid = text("群聊邀请确认").findOne().parent().parent().parent().findOne(clickable(true))
    wid.click()
    sleep(100)
    page_back()
    page_back()
    func.log('计时器已关闭，等待用户加入')
    state[state.team].no_money_mission = {}
}
function out_person(stay_num){
    //自行进入team_card,T完后返回一次，在teamcard页面
    if(state[state.team].person_num <= stay_num){return}
    let wid = null
    let person_num = state[state.team].person_num
    text('群成员').findOne().parent().parent().parent().parent().parent().click()//goto person page
    longClickable(true).depth(1+7).findOne()//wait page load
    for(let i=0;i<person_num-stay_num;i++){
        wid = longClickable(true).depth(1+7).find()
        wid[wid.length-1].longClick()
        text('移出').findOne().parent().parent().parent().click()
        sleep(100)
    }
    state[state.team].person_num = stay_num
    page_back()//back to team_card
}
function check_misson(team_wid,teamname){
    let ms = state[teamname].missions
    let m = state[teamname].no_money_mission
    let now = Date.now()
    log(ms,m)
    // log('check_misson missions['+ms.length+'],no_money_mission['+m.length+']')
    for(let i in ms){
        if(ms[i].time<now){
            log(teamname+':发送消息3，T出用户')
            chat(team_wid,teamname)
            send_msg(cfgs.user.msg3)//now is chat page
            open_team()
            page_back()//now is home page
            ms[i] = {}
        }else{
            log(ms[i].time-now+'ms 后将T出用户')
        }
    }
    
    if(!m.target){return}
    log(m.time-now+'ms 后无有效操作，将T出用户')
    if(m.time<now){
        chat(team_wid,teamname)
        m.target()//now is chat page
        page_back()//now is home page
    }
}
function wait_newmsg(){
    func.log('等待新消息...')
    let temp = ''
    let team_wid = null
    let unread_wid = null
    log(teams)
    // func.log(state[teams['team1']].unread_num);return
    while(1){
        for(let i in teams){
            log(teams[i])
            temp = depth(1+13).text(teams[i]).findOne(3000)
            if(!temp){
                func.log('找不到目标群'+teams[i]+'，请检查群聊名称设置')
                return
            }
            team_wid = temp.parent().parent()
            check_misson(team_wid,teams[i])
            unread_wid = team_wid.find(className("android.widget.TextView"))[0]
            // temp = team_wid.findOne(id('i9_')).text()
            // if(temp.indexOf('[拼手气红包]')+1){
            //     state[teams[i]].last_msg = '红包'
            //     state[teams[i]].last_user = temp.slice(7,temp.indexOf('@')+1)
            // }else{
            //     state[teams[i]].last_msg = temp.split(': ')[1]
            //     if(!state[teams[i]].last_msg){
            //         state[teams[i]].last_user = temp.split(': ')[0]
            //     }else{
            //         state[teams[i]].last_msg = temp
            //         state[teams[i]].last_user = 'Myself'
            //     }
            // }
            if(Number(unread_wid.text())){
                state[teams[i]].unread_num = unread_wid.text()
                return {team_wid: team_wid, teamname: teams[i], unread_num:unread_wid.text()}
            }else{
                if(team_wid.findOne(textContains('来自').depth(1+12))){
                    func.log('检测到新成员加入')
                    state[teams[i]].unread_num = 1
                    return {team_wid: team_wid, teamname: teams[i], unread_num:1}
                }
            }
        }
        sleep(100)
    }
}
function chat(team_wid,team_name){
    func.log('chat:'+team_name)
    team_wid.click()
    state.team = team_name
    func.log('进入群聊['+team_name+'],未读消息：'+state[team_name].unread_num)
}
function team_card(){
    //每次点击群名片顺便扫描群人数
    sleep(100)
    className("android.widget.TextView").depth(1+10).clickable(true).findOne().click()
    sleep(100)
    state[state.team].person_num = depth(1+12).className("android.widget.GridView").findOne().childCount()
    func.log('now person:'+state[state.team].person_num)
    sleep(100)
}
function save_data(data){
    // let msg_data = {
    //     team:state.team,
    //     user_name:'',
    //     vcode:'',
    //     money:'',
    //     msg:''
    // }
    // let txt = ''
    // let m = ''
    // for(let key in data){
    //     m = data[key] || 'None'
    //     txt += m + ' ---- '
    // }
    files.append(cfgs.user.save_to, '['+func.datetime()+']' + JSON.stringify(data)+'\n')
    func.log('数据已记录')
}
function send_msg(msg){
    editable(true).depth(15).findOne().setText(msg)
    text("发送").depth(1+14).findOne().click()
}
function is_join(msg){
    return msg.indexOf("二维码加入了") != -1
}
function get_vcode(msg){
    if (msg.length == 4 && Number(msg)){
        func.log('已获取验证码:'+msg)
        return true
    }
    else{return false}
}
function get_money(msg_wid){
    msg_wid.click()
    // 开
    let wid = className("android.widget.ImageView").depth(10).clickable(true).findOne(4000)
    let money = '0'
    if(wid){
        wid.click()
        money = text("元").findOne().parent().child(0).text()
    }else{
        func.log("红包派完了")
    }
    clickable(true).className("android.widget.TextView").depth(1+8).findOne().click()
    return money
}
function get_msg(num){
    num = num || state[state.team].unread_num
    func.log('get_msg：'+num)
    let msg_all = depth(1+9).className("android.widget.ListView").findOne().children()
    let msgbox = msg_all.slice(msg_all.length-1-num, msg_all.length-1)
    let user_msg_wid = []
    let sys_msg_wid = []
    let wid = null
    for(let i in msgbox){
        wid = msgbox[i].findOne(depth(1+18).className("android.widget.TextView"))
        wid && user_msg_wid.push(wid.parent().parent().parent().parent())
        wid = msgbox[i].findOne(depth(1+15).className("android.widget.TextView"))
        wid && sys_msg_wid.push(wid.parent().parent())
        wid = msgbox[i].findOne(text("红包").depth(1+16))
        wid && user_msg_wid.push(wid.parent().parent())
    }
    func.log('已获取 '+user_msg_wid.length+' 条用户消息，'+sys_msg_wid.length+' 条系统消息')
    return {user_msg_wid:user_msg_wid,sys_msg_wid:sys_msg_wid}
}

function saveConfig(){
    let Configs = cfgs.ui
    for(let key in Configs.Text){
        try{Configs.Text[key] = ui[key].text()}catch(e){log(e)}
    }
    for(let key in Configs.checked){
        try{Configs.checked[key] = ui[key].checked}catch(e){log(e)}
    }
    log(cfgs.ui)
    files.write('data/cfgs.json',JSON.stringify(cfgs))
}

function loadConfig(){
    let Configs = cfgs.ui
    for(let key in Configs.Text){
        try{ui[key].setText(Configs.Text[key])}catch(e){log(e)}
    }
    for(let key in Configs.checked){
        try{ui[key].checked=(Configs.checked[key])}catch(e){log(e)}
    }
    
}
sleep(5000)
func.log("任务结束")
