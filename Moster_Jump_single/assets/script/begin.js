// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        titleNode:cc.Node,
        role:cc.Node,
        tips:cc.Node,
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    runAnim(){
        this.role.runAction(cc.sequence(
            cc.rotateBy(1,360),
            cc.callFunc(()=>{
                this.runAnim();
            }),
        ));
    },
    onClick(){
        if(this.isMatch){//有匹配的
            this.role.stopAllActions();
            this.role.active = false;
            this.tips.active = false;
            window.app.send(JSON.stringify({
                key:"stopMatch",
            }));
        }else{//没有匹配
            this.role.active = true;
            this.tips.active = true;
            this.runAnim();
            console.log("---------")
            window.app.send(JSON.stringify({
                key:"startMatch",
            }));
        }
        this.isMatch = !this.isMatch;
        //cc.director.loadScene("game");
    },
    start () {
        this.isMatch = false;
        this.titleNode.runAction(
            cc.moveBy(1,0,-440).easing(cc.easeBackOut(3)),
        );
        window.app = new WebSocket("ws://localhost:8319/aoge");
        window.app.onmessage = (event)=>{
            let data = JSON.parse(event.data);
            if(data.key == "gameBegin"){
                cc.director.loadScene("game",()=>{
                    let scGame = cc.find("Canvas/game").getComponent("game");
                    scGame.initGame(data.isLeft);
                });
            }
        }
    },

    // update (dt) {},
});
