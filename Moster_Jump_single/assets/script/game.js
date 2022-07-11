// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        role1:cc.Node,
        role2:cc.Node,
        clickLayer:cc.Node,
        diciLayer:cc.Node,
        lbScore:cc.Label,
        lbTime:cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    initGame(idx){
        this.idx = idx;
        if(idx){
            this.role2.color =cc.color(0,255,0);
            this.role = this.role1;
            this.other = this.role2;
        }else{
            this.role1.color =cc.color(0,255,0);
            this.role = this.role2;
            this.other = this.role1;
        }
    },
    creatDiciLayer(){
        let newDici = cc.instantiate(this.diciItem);
        this.diciLayer.addChild(newDici);
        let rad;
        if(this.diciList.length){//有数据先用数据生产地刺
            rad = this.diciList.shift();
        }else{
            rad = Math.random() > 0.5;
            window.app.send(JSON.stringify({
                key:"creatDici",
                isLeft:rad,
            }));
        }
        //console.log(rad);
        //let diciItem = this.diciLayer.getChildren();
        if(rad){
            newDici.x = -Math.abs(newDici.x);
            newDici.scaleX = -Math.abs(newDici.scaleX);
        }
        let childList = this.diciLayer.children;
        for(let child of childList){
            child.y += 150;
            if(child.y >= 600){
                child.destroy();
            }
            if(child.y == 300){
                this.addScore();
            }
        }
    },
    addScore(){
        this.score ++;
        this.lbScore.string = this.score;
    },
    doGameover(){
        window.app.send(JSON.stringify({
            key:"deathDici",
            deathIdx:this.idx,
        }));
    },
    onGameover(scoreList,deathIdx){
        // console.log("111111");
        //这个匿名函数跳转过后再运行
        this.time = 0;
        let selfIdx = this.idx?1:0;
        let otherIdx = selfIdx ^ 1;
        let isWin = (selfIdx == deathIdx)?false:true;
        cc.director.loadScene("over",()=>{
            let tscore = this.score;
            let scNode = cc.find("/Canvas/over");
            let overSc = scNode.getComponent("over");
            console.log(selfIdx);
            let selfScore = scoreList[selfIdx];
            let otherScore = scoreList[otherIdx];
            overSc.initSocre(isWin,selfScore,otherScore,true);//传递过去的数要断开连接
        });
    },
    doCollosinCheck(){
        for(let child of this.diciLayer.children){
            if(child.y == 300 && this.role.x * child.x > 0){//2  同一侧
                this.doGameover();
            }
        }
    },
    doHeroMove(role,isLeft){
        // if(isLeft){
        //     if(role.x < 0){//原地跳
        //         let target =role.x + 50;
        //         let nowpos =role.x;
        //         role.runAction(cc.sequence(
        //             cc.moveTo(0.04,target,role.y),
        //             cc.moveTo(0.04,nowpos,role.y),
        //             cc.callFunc(()=>{
        //                 this.doCollosinCheck();
        //             }),
        //         ))
        //     }else{//右边到左边
        //         let target = -Math.abs(role.x);
        //         role.runAction(cc.sequence(
        //             cc.moveTo(0.04,0,role.y),
        //             cc.callFunc(()=>{
        //                 role.scaleX = Math.abs(role.scaleX);
        //             }),
        //             cc.moveTo(0.04,target,role.y),
        //             cc.callFunc(()=>{
        //                 this.doCollosinCheck();
        //             }),
        //         ))
        //     }
        // }else{
        //     if(role.x > 0){
        //         let target =role.x - 50;
        //         let nowpos =role.x;
        //         role.runAction(cc.sequence(
        //             cc.moveTo(0.04,target,role.y),
        //             cc.moveTo(0.04,nowpos,role.y),
        //             cc.callFunc(()=>{
        //                 this.doCollosinCheck();
        //             }),
        //         ))
        //     }else{//左边到右边
        //         let target = Math.abs(role.x);
        //         role.runAction(cc.sequence(
        //             cc.moveTo(0.04,0,role.y),
        //             cc.callFunc(()=>{
        //                 role.scaleX = -Math.abs(role.scaleX);
        //             }),
        //             cc.moveTo(0.04,target,role.y),
        //             cc.callFunc(()=>{
        //                 this.doCollosinCheck();
        //             }),
        //         ))
        //     }
        // } if (isLeft) {
            // 点击左边
            if (isLeft) {
                // 点击左边
                if (role.x < 0) {
                    // 角色一开始在左边
                    role.runAction(cc.sequence(
                        cc.moveBy(0.03, 50, 0),
                        cc.moveBy(0.03, -50, 0),
                        cc.callFunc(() => {
                            this.doCollosinCheck();
                        }), // 函数动作，播放效果为调用函数
                    ));
                }
                else {
                    role.runAction(cc.sequence(
                        cc.moveTo(0.06, -Math.abs(role.x), role.y),
                        cc.callFunc(() => {
                            role.scaleX = Math.abs(role.scaleX);
                            this.doCollosinCheck();
                        }), // 函数动作，播放效果为调用函数
                    ));
                }
            }
            else {
                // 点击右边
                if (role.x > 0) {
                    // 角色一开始在右边
                    role.runAction(cc.sequence(
                        cc.moveBy(0.03, -50, 0),
                        cc.moveBy(0.03, 50, 0),
                        cc.callFunc(() => {
                            this.doCollosinCheck();
                        }), // 函数动作，播放效果为调用函数
                    ));
                }
                else {
                    role.runAction(cc.sequence(
                        cc.moveTo(0.06, Math.abs(role.x), role.y),
                        cc.callFunc(() => {
                            role.scaleX = -Math.abs(role.scaleX);
                            this.doCollosinCheck();
                        }), // 函数动作，播放效果为调用函数
                    ));
                }
            }
    },
    onTouchStart(event){
        // 
        let clickPos = event.getLocation();
        //console.log(clickPos);
        let x = clickPos.x - cc.winSize.width/2;
        let y = clickPos.y - cc.winSize.height/2;
        let isLeft = x < 0;
        this.doHeroMove(this.role, isLeft);
        this.other.runAction(cc.moveBy(0.06, 0, 150));
        this.creatDiciLayer();
        window.app.send(JSON.stringify({
            key: "click",
            isLeft: isLeft,
        }));
    },
    doOutTime(scoreList,selfIdx){
        this.time = 0;
        let otherIdx = selfIdx^1;
        let isWin = scoreList[selfIdx] > scoreList[otherIdx];
        cc.director.loadScene("over",()=>{
            let tscore = this.score;
            let scNode = cc.find("/Canvas/over");
            let overSc = scNode.getComponent("over");
            console.log(selfIdx);
            let selfScore = scoreList[selfIdx];
            let otherScore = scoreList[otherIdx];
            overSc.initSocre(isWin,selfScore,otherScore,false);//传递过去的数要断开连接
        });
        //console.log(isWin ? "获胜" : "失败", scoreList[selfIdx], scoreList[otherIdx]);//点一次就加分的
    },
    start () {
        this.score = 0;
        this.time = 60;
        // this.role = this.role1;
        // this.other = this.role2;
        this.diciItem = this.diciLayer.getChildByName("dici");
        this.diciList = [];
        this.diciItem.removeFromParent();//移除关系
        this.clickLayer.on(cc.Node.EventType.TOUCH_START,(event)=>{
            this.onTouchStart(event);
        });
        window.app.onmessage = (event)=>{
            let data = JSON.parse(event.data);
            if(data.key == "click"){
                this.doHeroMove(this.other,data.isLeft);
                this.other.runAction(cc.moveBy(0.06,0,-150));
            }else if(data.key == "creatDici"){
                // console.log("收到");
                // console.log(this.diciList);
                this.diciList.push(data.isLeft);
            }else if(data.key == "outTime"){
                this.doOutTime(data.score,data.idx);
            }else if(data.key == "deathDici"){
                this.onGameover(data.score,data.deathIdx);
            }
        }
    },

    update (dt) {
        if(this.time > 0){
            this.time -= dt;
            if(this.time < 0){
                this.time = 0;
            }
            this.lbTime.string = Math.ceil(this.time);
        }
    },
});
