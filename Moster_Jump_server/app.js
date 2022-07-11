let express = require("express");//导入express 包 短链接
let express_ws = require("express-ws");//导入express-ws 包 可以长链接
let app = express();//express() 让进程不断的运行 不中断
express_ws(app);//升级app  可以长连接了
// app.get("/aoge",(req,res)=>{//aoge为路由  这个使用udp 短链接传输
//     console.log("----- 服务器收到了消息",req.query);
//     res.send("从服务器发来的消息");
// });
// let userData= {};
// app.get("/regsit",(req,res)=>{
//     let account = req.query.account;
//     let password = req.query.password;
//     if(password == null || account == null){
//         res.send("注册失败，账号或密码不能为空");
//         return;
//     }
    
//     let number = 0;
//     var reg1 = /^[0-9]+.?[0-9]*$/;//数字正则
//     var reg2 = /^[A-Z]+$/;//大写字母正则
//     var reg3 = /^[a-z]+$/;//小写字母正则
//     let flag1 = 0;
//     let flag2 = 0;
//     let flag3 = 0;
//     if(!userData[account]){//不存在账号
//         if(password.length < 5 || password.length > 10){
//             console.log("长度"+ password.length);
//             res.send("注册失败,密码不能少于5位,不能大于10为");
//             return;
//         }else{
//             for(let i=0;i<password.length;i++){
//                 if(reg1.test(password[i])){
//                     flag1 = 1;
//                     console.log("存在数字");
//                 }
//                 if(reg2.test(password[i])){
//                     flag2 = 1;
//                     console.log("大写存在字母");
//                 }
//                 if(reg3.test(password[i])){
//                     flag3 = 1;
//                     console.log("小写存在字母");
//                 }
//             }
//             let temp = flag1 * 100 + flag2 * 10 + flag3;
//             console.log(flag1 * 100 + flag2 * 10 + flag3);
//             if(temp == 0 || temp == 10 ||temp == 100 ||temp == 1){
//                 res.send("注册失败，密码中必须要包含数字，大写字母，小写字母中的两种");
//                 return;
//             }
//         }
//         userData[account] = password;
//         res.send("注册成功");
//     }else{
//         res.send("注册失败，账号已存在");
//     }
//     return;
// });
// app.get("/login",(req,res)=>{
//     let account = req.query.account;
//     let password = req.query.password;
//     console.log(account);
//     console.log(password);
//     if(!userData[account]){
//         res.send("登录失败，账号不存在");
//     }
//     if(userData[account] != password){
//         res.send("登录失败，密码错误");
//     }else{
//         res.send("登录成功，欢迎回来");
//     }
// });

/*
app = new WebSocket("ws://localhost:7714/game") // 连接服务器
app.onmessage = (event)=>{console.log(event.data)}  // 客户端的听
app.send("吃了没")  // 客户端的说
*/
let matchList = [];
let g_RoomId = 1000;
let g_Room = {};
app.ws("/aoge",(ws,res)=>{
    console.log("有人链接");
    ws.on("message",(data)=>{//服务器监听 message 类型的信息
        // console.log(data);
        // console.log("收到客户端的消息");
        // ws.send("来自服务端的消息");
        data = JSON.parse(data);//解构json格式
        if(data.key == "startMatch"){
            
            matchList.push(ws);
            console.log(matchList.length);
            if(matchList.length >= 2){
                let ws1 = matchList.pop();
                let ws2 = matchList.pop();
                ws1.idx = 0;
                ws2.idx = 1;
                ws1.roomId = g_RoomId;//存id
                ws2.roomId = g_RoomId;
                let room = g_Room[g_RoomId] = {//还存了 临时变量room
                    player:[ws1,ws2],
                    score:[0,0],
                }
                g_Room[g_RoomId].outTime = setTimeout(()=>{
                    doOutTime(room);
                },10000);
               ws1.send(JSON.stringify({
                    key:"gameBegin",
                    isLeft : true ,//isleft 是否是当前控制角色
               }));
               ws2.send(JSON.stringify({
                    key:"gameBegin",
                    isLeft : false,
               }));
               g_RoomId ++;
            }
        }else if(data.key == "stopMatch"){
            let idx = -1;
            for(let i=0;i<matchList.length;i++){
                if(matchList[i] == ws){
                    idx = i;
                    break;
                }
            }
            if(idx != -1){
                // [].splice(a,b,c1,c2,c3....)  
                // 在[]中以a为下标开始，将梁旭的b个元素删除，然后把c们按参数顺序插入到删除的缺口中
                matchList.splice(idx,1);
            }
        }else if(data.key == "click"){
            let roomId = ws.roomId;
            let room = g_Room[roomId];
            let player = room.player;//这个是当前房间的玩家列表
            room.score[ws.idx] ++;
            let other = null;
            for(let tws of player){
                if(ws != tws){
                    other = tws;
                }
            }
            other.send(JSON.stringify({
                key:"click",
                isLeft:data.isLeft,
            }));
        }else if(data.key == "creatDici"){
            let roomId = ws.roomId;
            let room = g_Room[roomId];
            let player = room.player;//这个是当前房间的玩家列表
            let other = null;
            //console.log(data.isLeft);
            for(let tws of player){
                if(ws != tws){
                    other = tws;
                }
            }
            other.send(JSON.stringify({
                key:"creatDici",
                isLeft:data.isLeft,
            }));
        }else if(data.key == "deathDici"){
            //console("-----------------------");
            let roomId = ws.roomId;
            for(let tws of g_Room[roomId].player){
                tws.send(JSON.stringify({
                    key:"deathDici",
                    score:g_Room[roomId].score,
                    deathIdx:data.deathIdx,
                }));
            }
        }
    });
});

function doOutTime(room){
    for(let tWs of room.player){
        tWs.send(JSON.stringify({
            key:"outTime",
            score:room.score,
            idx:tWs.idx,
        }));
    }
}
express
app.listen(8319);//监听端口