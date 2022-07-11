// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        clickLayer:cc.Node,
        lbScore:cc.Label,
        lbMessage:cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:
    initSocre(isWin,score1,score2,flag){
        this.target = score1;
        
        let message = (isWin? "你赢了":"你输了");
        if(flag){
            message +="\n原因是"+(isWin? "你的对手碰瓷":"你碰瓷了");
        }
        message +="\n你的分数是"+score1;
        message +="\n你的分数是"+score2;
        this.lbMessage.string = message;
    },
    onLoad () {
        this.target = 0;
        this.score = 0;
    },

    start () {
        this.clickLayer.on(cc.Node.EventType.TOUCH_START,()=>{
            cc.director.loadScene("game");
        });
    },

    update (dt) {
        if(this.score < this.target){
            this.score ++;
            this.lbScore.string = this.score;
        }
    },
});
