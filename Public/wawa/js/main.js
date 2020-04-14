window.onload = function() {
    init(40, "legend", 750, 1330, main);
}
var baseUrl = '../Public/wawa/images/';
var imgData = [{
    type: "js",
    path: "../Public/wawa/js/mybase.js"
}, {
    name: "front",
    path: baseUrl + "front.png"
}, {
    name: "ground",
    path: baseUrl + "ground.png"
}, {
    name: "paw",
    path: baseUrl + "paws1.png"
}, {
    name: "more",
    path: baseUrl + "more.png"
}, {
    name: "bird",
    path: baseUrl + "bird.png"
}];
var dataList = {};
var showPrize = [];
var itemInfo = {
    x: [],
    y: [],
    itemObj: []
};
var direct = 0; //爪子偏差弧度，决定物体旋转的角度；
var dx = 5; //爪子x移动的距离
var dy = 5; //爪子移动y距离
var ds = 0.95; //爪子缩放
var scaleArr = [0.8, 0.9, 1];
var pos = 1; //爪子的位置层 纵向坐标
var idx = -1; //碰触玩具的索引 横向坐标
var isPaw; //概率是否成功10次中2次有几率成功 谢谢参与
var prizeID; //1-8个奖品随机
var mytime1, mytime2; //时间
var mydata = {
    left: false,
    right: false,
    up: false,
    down: false,
    paw: false
};

var loadingLayer, pawLayer, backLayer, itemLayer, firstLayer, menuLayer, popLayer, player, rectbox;


function main() {

    if (LGlobal.canTouch) {
        LGlobal.stageScale = LStageScaleMode.NO_BORDER;
        LSystem.screen(LStage.FULL_SCREEN);
    } else {
        LGlobal.stageScale = LStageScaleMode.SHOW_ALL;
        LSystem.screen(LStage.FULL_SCREEN);
        var cw = $('canvas').width();
        var cm = $('canvas').css('marginLeft');
        $('.logocon').css({
            'width': cw,
            'left': cm
        });
        var sw = cw + parseInt(cm) - 52 + 'px';
        $('.sharecon').css({
            'left': sw
        });
    }
    //LGlobal.setDebug(true);

    LGlobal.preventDefault = true; //滚屏事件 true禁止滚平 flase滚屏
    LMouseEventContainer.set(LMouseEvent.MOUSE_DOWN, false);
    LMouseEventContainer.set(LMouseEvent.MOUSE_UP, false);
    LMouseEventContainer.set(LMouseEvent.MOUSE_MOVE, false);
    backLayer = new LSprite();
    addChild(backLayer);
    firstLayer = new LSprite();
    addChild(firstLayer);
    loadingLayer = new LoadingSample4();
    addChild(loadingLayer);
    /**读取图片*/
    LLoadManage.load(
        imgData,
        function (progress) {
            loadingLayer.setProgress(progress);
        },
        gameInit
    );
}

function gameInit(result) {
    dataList = result;
    removeChild(loadingLayer);
    loadingLayer = null;
    //添加背景
    bgBitmap = new LBitmap(new LBitmapData(dataList["ground"]));
    bgBitmap.y = 727;
    bgBitmap.x = 0;
    backLayer.addChild(bgBitmap);

    //添加箱子碰撞发范围
    rectbox = new LSprite();
    rectbox.x = 530;
    rectbox.y = 750;
    rectbox.alpha = 0;
    rectbox.graphics.drawRect(1, "#000000", [0, 0, 160, 10]);
    backLayer.addChild(rectbox);

    //奖项设置
    showPrize = [{
        tip: "一等奖",
        img: "prize1"
    }, {
        tip: "二等奖",
        img: "prize2"
    }, {
        tip: "三等奖",
        img: "prize3"
    }, {
        tip: "四等奖",
        img: "prize4"
    }, {
        tip: "五等奖",
        img: "prize5"
    }, {
        tip: "六等奖",
        img: "prize6"
    }, {
        tip: "七等奖",
        img: "prize7"
    }, {
        tip: "八等奖",
        img: "prize8"
    }];
    //添加菜单
    addMene();
    addPlayer();

}




function addMene() {

    var frontBitmap = new LBitmap(new LBitmapData(dataList["front"]));
    firstLayer.addChild(frontBitmap);

    upBtn = new LButton(new LBitmap(new LBitmapData(dataList["more"], 126, 14, 80, 80)));
    upBtn.x = 156;
    upBtn.y = 950;
    firstLayer.addChild(upBtn);

    downBtn = new LButton(new LBitmap(new LBitmapData(dataList["more"], 429, 14, 80, 80)));

    downBtn.x = 156;
    downBtn.y = 1105;
    firstLayer.addChild(downBtn);

    leftBtn = new LButton(new LBitmap(new LBitmapData(dataList["more"], 225, 14, 80, 80)));

    leftBtn.x = 83;
    leftBtn.y = 1028;
    firstLayer.addChild(leftBtn);

    rightBtn = new LButton(new LBitmap(new LBitmapData(dataList["more"], 326, 14, 80, 80)));
    rightBtn.x = 231;
    rightBtn.y = 1028;
    firstLayer.addChild(rightBtn);

    okBtn = new LButton(new LBitmap(new LBitmapData(dataList["more"], 355, 147, 219, 219)));
    okBtn.x = 434;
    okBtn.y = 954;
    firstLayer.addChild(okBtn);

    menuBtn = new LButton(new LBitmap(new LBitmapData(dataList["more"], 0, 0, 62, 128)));
    menuBtn.x = 0;
    menuBtn.y = 700;
    menuBtn.alpha = 0.5;
    firstLayer.addChild(menuBtn);



    menuLayer = new LSprite();
    menuLayer.x = -70;
    firstLayer.addChild(menuLayer);

    var shape = new LShape();
    shape.graphics.drawRect(1, "#cccccc", [0, 500, 65, 180], true, "#000000");
    shape.graphics.drawLine(1, "#000000", [0, 590, 64, 590]);
    shape.alpha = 0.3;
    menuLayer.addChild(shape);
    ruleBtn = new ListButton(0, 590, 65, 90, 'prize', menuLayer);
    prizeBtn = new ListButton(0, 500, 65, 90, 'rule', menuLayer);
    var ruleText = new txtMenu("我的\n獎品", menuLayer, 10, 515);
    var prizeText = new txtMenu("活動\n規則", menuLayer, 10, 606);


}

function initData() {
    direct = 0; //爪子偏差弧度，决定物体旋转的角度；
    ds = 0.95; //爪子缩放
    pos = 1; //爪子的位置层 纵向坐标
    idx = -1; //碰触玩具的索引 横向坐标
    mydata = {
        left: false,
        right: false,
        up: false,
        down: false,
        paw: false
    };
    itemInfo = {
        x: [],
        y: [],
        itemObj: []
    };
    prizeID = Math.floor(Math.random() * 8); //1-8个奖品随机
    //console.log('prizeID:' + prizeID);
}

function addPlayer() {
    initData();
    itemLayer = new LSprite();
    backLayer.addChild(itemLayer);
    pawLayer = new LSprite();
    backLayer.addChild(pawLayer);



    lineshape = new LShape();
    pawLayer.addChild(lineshape);
    lineshape.graphics.drawLine(7, "#000000", [0, -500, 0, 210]);
    pawLayer.x = 100;
    pawLayer.y = 50;

    pawLayer.scaleX = pawLayer.scaleY = scaleArr[pos];

    var list = LGlobal.divideCoordinate(450, 216, 2, 3);
    pawBitmap = new LBitmapData(dataList["paw"], 0, 0, 150, 108);
    player = new LAnimationTimeline(pawBitmap, list);
    player.x = -player.getWidth() / 2;
    player.y = 200;
    pawLayer.addShape(LShape.RECT, [player.x, player.y, pawBitmap.getWidth(), pawBitmap.getWidth() * 0.2]);
    pawLayer.addChild(player);
    player.setLabel("open", 0, 0, 0, false);
    player.stop("open");

    addItme();
    addEvent();
}

function addItme() {
    for (var i = 0; i < 3; i++) {
        var colItem = [];
        var xItem = [];
        var yItem = [];
        for (var j = 0; j < 3; j++) {
            var eLayer = new LSprite();
            var bitmap = new LBitmap(new LBitmapData(dataList["bird"]));
            eLayer.x = 40 + Math.ceil(Math.random() * 50) + (j * bitmap.getWidth());
            eLayer.y = 650 + Math.ceil(Math.random() * 20) + i * 60;
            eLayer.scaleX = eLayer.scaleY = scaleArr[i];
            eLayer.addChild(bitmap);
            eLayer.name = "egg" + i + "-" + j;
            itemLayer.addChild(eLayer);
            colItem.push(eLayer);
            xItem.push(eLayer.x);
            yItem.push(eLayer.y);
        }

        itemInfo.itemObj.push(colItem);
        itemInfo.x.push(xItem);
        itemInfo.y.push(yItem);
    }

}

function addEvent() {
    prizeBtn.mouseEnabled = true;
    ruleBtn.mouseEnabled = true;
    prizeBtn.addEventListener(LMouseEvent.MOUSE_DOWN, onprize);
    ruleBtn.addEventListener(LMouseEvent.MOUSE_DOWN, onrule);
    menuBtn.addEventListener(LMouseEvent.MOUSE_UP, onMenuChange);
    upBtn.addEventListener(LMouseEvent.MOUSE_UP, onUp);
    downBtn.addEventListener(LMouseEvent.MOUSE_UP, onDown);

    leftBtn.addEventListener(LMouseEvent.MOUSE_UP, onupLeft);
    leftBtn.addEventListener(LMouseEvent.MOUSE_DOWN, ondownLeft);
    rightBtn.addEventListener(LMouseEvent.MOUSE_UP, onupRight);
    rightBtn.addEventListener(LMouseEvent.MOUSE_DOWN, ondownRight);

    okBtn.addEventListener(LMouseEvent.MOUSE_UP, onOK);
    backLayer.addEventListener(LEvent.ENTER_FRAME, onframe);

    upBtn.alpha = 1;
    downBtn.alpha = 1;
    leftBtn.alpha = 1;
    rightBtn.alpha = 1;
    okBtn.alpha = 1;
    upBtn.setState(LButton.STATE_ENABLE);
    downBtn.setState(LButton.STATE_ENABLE);
    leftBtn.setState(LButton.STATE_ENABLE);
    rightBtn.setState(LButton.STATE_ENABLE);
    okBtn.setState(LButton.STATE_ENABLE);
}

function removeEvent() {
    upBtn.alpha = 0.7;
    downBtn.alpha = 0.7;
    leftBtn.alpha = 0.7;
    rightBtn.alpha = 0.7;
    okBtn.alpha = 0.7;
    upBtn.setState(LButton.STATE_DISABLE);
    downBtn.setState(LButton.STATE_DISABLE);
    leftBtn.setState(LButton.STATE_DISABLE);
    rightBtn.setState(LButton.STATE_DISABLE);
    okBtn.setState(LButton.STATE_DISABLE);
    mydata.left = false;
    mydata.right = false;
    mydata.up = false;
    mydata.down = false;

    upBtn.removeEventListener(LMouseEvent.MOUSE_UP, onUp);
    downBtn.removeEventListener(LMouseEvent.MOUSE_UP, onDown);
    leftBtn.removeEventListener(LMouseEvent.MOUSE_UP, onupLeft);
    leftBtn.removeEventListener(LMouseEvent.MOUSE_DOWN, ondownLeft);
    rightBtn.removeEventListener(LMouseEvent.MOUSE_UP, onupRight);
    rightBtn.removeEventListener(LMouseEvent.MOUSE_DOWN, ondownRight);
    okBtn.removeEventListener(LMouseEvent.MOUSE_UP, onOK);
}

function onMenuChange() {

    if (menuLayer.x == 0) {
        LTweenLite.to(menuLayer, 0.3, {
            x: -70,
            ease: LEasing.Sine.easeInOut
        });
    } else {
        LTweenLite.to(menuLayer, 0.3, {
            x: 0,
            ease: LEasing.Sine.easeInOut
        });
    }
}


function openPrize() {
    var prizeTip = '';
    popLayer = new LSprite();
    popLayer.alpha = 0;
    popLayer.x = 350;
    popLayer.y = 400;
    popLayer.scaleX = popLayer.scaleY = 0
    firstLayer.addChild(popLayer);

    var bitmap = new LBitmap(new LBitmapData(dataList["bird"]));
    bitmap.x = 310;
    bitmap.y = 293;
    popLayer.addChild(bitmap);

    var shape = new LShape();
    popLayer.addChild(shape);
    shape.graphics.drawRoundRect(20, "#9e7024", [150, 400, 450, 500, 30], true, "#fdeba7");


    if (isPaw == false || isPaw == undefined) {
        prizeTip = '謝謝參與'
        againBtn = new LButton(new LBitmap(new LBitmapData(dataList["more"], 0, 152, 324,
            70)), new LBitmap(new LBitmapData(dataList["more"], 0, 152, 324, 70)));
        againBtn.x = 210;
        againBtn.y = 650;
        popLayer.addChild(againBtn);
        againBtn.addEventListener(LMouseEvent.MOUSE_DOWN, onagain);
    } else {
        prizeTip = showPrize[prizeID].tip;
        useBtn = new LButton(new LBitmap(new LBitmapData(dataList["more"], 0, 327, 324,
            70)), new LBitmap(new LBitmapData(dataList["more"], 0, 327, 324, 70)));
        useBtn.x = 210;
        useBtn.y = 650;
        popLayer.addChild(useBtn);
        useBtn.addEventListener(LMouseEvent.MOUSE_DOWN, onuse);
    }
    shareBtn = new LButton(new LBitmap(new LBitmapData(dataList["more"], 0, 241, 324, 70)),
        new LBitmap(new LBitmapData(dataList["more"], 0, 241, 324, 70)));
    shareBtn.x = 210;
    shareBtn.y = 750;
    popLayer.addChild(shareBtn);
    shareBtn.addEventListener(LMouseEvent.MOUSE_DOWN, onshare);

    var textField = new LTextField();
    textField.text = prizeTip;
    textField.size = 70;
    textField.color = "#70381d";
    textField.weight = "bolder";
    textField.x = 250;
    textField.y = 490;

    popLayer.addChild(textField);
    //添加奖项

    LTweenLite.to(popLayer, 0.6, {
        scaleX: 1,
        scaleY: 1,
        alpha: 1,
        x: 0,
        y: 50,
        ease: LEasing.Strong.easeOut,
    })

}

//事件
function onUp() {
    pos = pos - 1;
    if (pos <= 0) {
        pos = 0;
    }
    pawLayer.scaleY = pawLayer.scaleX = scaleArr[pos];
}


function onDown() {
    pos = pos + 1;
    if (pos >= 2) {
        pos = 2;

    }
    pawLayer.scaleX = pawLayer.scaleY = scaleArr[pos];

}



function onupLeft() {

    mydata.left = false;
    mydata.right = false;
}

function ondownLeft(e) {
    e.preventDefault
    mydata.left = true;
}

function onupRight() {
    mydata.right = false;
    mydata.right = false;
}


function ondownRight(e) {
    e.preventDefault
    mydata.right = true;
}

function onOK() {
    player.setLabel("close", 1, 1, 0, true);
    player.gotoAndStop("close");
    mydata.paw = true;
    removeEvent();
    idx = hitTest();
}

function hitTest() {
    var pawx = pawLayer.x - pawBitmap.getWidth() * scaleArr[pos] / 2;

    var ix = -1;
    for (var i = 0; i < itemInfo.x[pos].length; i++) {
        if (pawx <= itemInfo.x[pos][i] + itemInfo.itemObj[pos][i].getWidth() / 2) {
            ix = i
            break;
        }
    }
    return ix;
}

function hitNull() {
    LTweenLite.to(pawLayer, 2, {
        y: 50,
        onComplete: function () {
            openPrize();
        }
    });

}

function setDirect(offset, num) {
    var d = 0;
    if (offset >= 0) {
        d = offset - num
    } else {
        d = offset + num
    }
    return d;
}


function hitting() {
    var randomtime1 = Math.ceil(Math.random() * 2000); //随机时间 当爪子和物体差距大的时候 3s内随机托爪
    var randomtime2 = 2000 + Math.ceil(Math.random() * 2000); //随机时间 当爪子和物体差距小的时候 4s内随机托爪
    var itemHeight = itemInfo.y[pos][idx];

    var pawx = pawLayer.x - parseInt(pawBitmap.getWidth() * scaleArr[pos] / 2);
    var offsetx = pawx - itemInfo.x[pos][idx]; //弧度

    var val = Math.abs(pawx - itemInfo.x[pos][idx]);
    //console.log('差值' + val);
    if (val > 40) {
        LTweenLite.to(pawLayer, 1.6, {
            y: 50,
            onComplete() {
                openPrize();
            }
        });
    } else {
        mytime1 = setInterval(function () {
            pawLayer.y = pawLayer.y - dy;
            itemInfo.itemObj[pos][idx].y = itemInfo.itemObj[pos][idx].y - dy;
            if (pawLayer.y < 50) {
                clearInterval(mytime1);
                turnRight(idx);
            }
        }, 50);
        if (val <= 8) {
            probability();
        } else if (val > 8 && val <= 20) {
            //console.log('方向值：' + offsetx);
            var d = setDirect(offsetx, 8)
            setTimeout(function () {
        
                //itemInfo.itemObj[pos][idx].y=itemInfo.itemObj[pos][idx].y+dy;
                LTweenLite.to(itemInfo.itemObj[pos][idx], 0.3, {
                    rotate: d,
                    // y: itemInfo.itemObj[pos][idx].y + 4,
                    onComplete: function () {
                        clearInterval(mytime1);
                        LTweenLite.to(pawLayer, 0.8, {
                            y: 50
                        });
                    }
    
                }).to(itemInfo.itemObj[pos][idx], 0.8, {
                    y: itemHeight,
                    ease: LEasing.Strong.easeIn,
                    onComplete: function () {
                        openPrize();
                    }
                });
            }, randomtime2)
        } else {
            var d = setDirect(offsetx, 20)
            setTimeout(function () {               
                LTweenLite.to(itemInfo.itemObj[pos][idx], 0.2, {
                    rotate: d,
                    // y: itemInfo.itemObj[pos][idx].y + 4,
                    onComplete: function () {
                        clearInterval(mytime1);
                        LTweenLite.to(pawLayer, 1.2, {
                            y: 50
                        });
                    }
    
                }).to(itemInfo.itemObj[pos][idx], 0.3, {
                    y: itemHeight,
                    ease: LEasing.Strong.easeIn,
                    onComplete: function () {
                        openPrize()
                    }
                });
            }, randomtime1)
        }


    }





}
//概率
function probability() {
    isPaw = Math.ceil(Math.random() * 10) > 4 ? true : false; //概率是否成功10次中6次有几率成功 谢谢参与
    console.log(isPaw);
    var itemHeight = itemInfo.y[pos][idx] + Math.random() * 5 - Math.random() * 5;
    var randomtime = 2000 + Math.ceil(Math.random() * 5000); //随机时间 当需要概率的后脱爪
    var angle = -8 + Math.ceil(Math.random() * 15);
    if (!isPaw) {
        switch (idx) {
            case 0:
                randomtime = 2000 + Math.ceil(Math.random() * 5000);
                break;
            case 1:
                randomtime = 2000 + Math.ceil(Math.random() * 4000);
                break;
            case 2:
                randomtime = 2000 + Math.ceil(Math.random() * 2000);
                break;
        }
        console.log(randomtime);
        setTimeout(function () {
            LTweenLite.to(itemInfo.itemObj[pos][idx], 0.5, {
                rotate: angle,
                // y: itemInfo.itemObj[pos][idx].y + 5,

            }).to(itemInfo.itemObj[pos][idx], 0.4, {
                rotate: -angle,
                // y: itemInfo.itemObj[pos][idx].y + 4,
                onComplete: function () {
                    clearInterval(mytime2);
                    clearInterval(mytime1);
                    LTweenLite.to(pawLayer, 0.8, {
                        y: 50
                    });
                }

            }).to(itemInfo.itemObj[pos][idx], 0.8, {
                y: itemHeight,
                ease: LEasing.Strong.easeIn,
                onComplete: function () {
                    openPrize();
                }
            });
        }, randomtime)
    }else{
        var angle1 = -5 + Math.ceil(Math.random() * 10);
        console.log(angle1);
        var randomtime3 = 1000 + Math.ceil(Math.random() * 3000);
        setTimeout(function () {
            LTweenLite.to(itemInfo.itemObj[pos][idx], 0.5, {
                rotate: angle1
            }).to(itemInfo.itemObj[pos][idx], 0.4, {
                rotate: 2,
                delay:randomtime3
            })
        }, randomtime)
    }

}
//向右的时候
function turnRight() {
    var finalItemHeight = itemInfo.y[2][0] + Math.ceil(Math.random() * 20) - Math.ceil(Math.random() * 20);
    mytime2 = setInterval(function () {
        pawLayer.x = pawLayer.x + dx;
        itemInfo.itemObj[pos][idx].x = itemInfo.itemObj[pos][idx].x + dx;
        if (pawLayer.x > 560 && itemInfo.itemObj[pos][idx].x > 560) {
            clearInterval(mytime2);
            player.gotoAndStop("close");
            LTweenLite.to(itemInfo.itemObj[pos][idx], 1, {
                y: finalItemHeight,
                ease: LEasing.Strong.easeIn,
                onComplete: function () {
                    openPrize();
                }
            });
        }
    }, 50);
}

function onframe() {
    //console.log(mydata.right);
    if (mydata.right == true) {
        if (pawLayer.x > 620) {
            pawLayer.x = 620;
            mydata.right = false;
        } else {
            pawLayer.x += dx;
        }

    }
    if (mydata.left == true) {
        if (pawLayer.x < 100) {
            pawLayer.x = 100;
            mydata.left = false;
        } else {
            pawLayer.x -= dx;
        }
    }
    if (mydata.paw == true) {
        if (idx == -1) {
            if (pawLayer.hitTestObject(rectbox)) {
                console.log('null')
                mydata.paw = false;
                hitNull()
                player.gotoAndStop("open");
            } else {
                pawLayer.y += dy;
            }


        } else {
            if (pawLayer.hitTestObject(itemInfo.itemObj[pos][idx])) {

                player.gotoAndStop("open");
                hitting();
                mydata.paw = false;
            } else {
                pawLayer.y += dy;

            }
        }


    }

}


function onagain() {
    popLayer.removeAllChild();
    pawLayer.removeAllChild();
    firstLayer.removeChild(popLayer);
    backLayer.removeChild(itemLayer);
    backLayer.removeChild(pawLayer);

    backLayer.removeEventListener(LEvent.ENTER_FRAME, onframe);
    againBtn.removeEventListener(LMouseEvent.MOUSE_DOWN, onagain);
    shareBtn.removeEventListener(LMouseEvent.MOUSE_DOWN, onshare);
    $("body,html").removeClass("forbid-scroll");

    addPlayer();
}

function onshare() {

    console.log('share');
}

function onuse(event) {
    console.log('use');
}


function onprize() {
    console.log('prize');
}

function onrule() {
    LGlobal.preventDefault = false;
    var html =
        '<div style="margin:0 auto;line-height:1.7;color:#fff;font-size:14px;">\
        <p>活動時間：7月1日-7月6日<br />活動規則：<br />1.关注日日顺服务成为会员，即可点击“GO”参与活动；<br/> 2.每位会员每天有3次机会参与大转盘游戏;<br/> 3.10元购买指定款净水产品特权、净芯杯、微店优惠券、会员积分、10元话费等你来拿；<br/> 4.奖品信息以实际中奖结果为准，截图无效。<br/> *本活动最终解释权归日日顺服务所有<br/> *本活动最终解释权归日日顺服务所有<br/> *本活动最终解释权归日日顺服务所有<br/> *本活动最终解释权归日日顺服务所有<br/> *本活动最终解释权归日日顺服务所有<br/> *本活动最终解释权归日日顺服务所有<br/> *本活动最终解释权归日日顺服务所有<br/> *本活动最终解释权归日日顺服务所有<br/> *本活动最终解释权归日日顺服务所有<br/> *本活动最终解释权归日日顺服务所有</p></div>';
    mypop('活动规则', html);
    if (!LGlobal.canTouch) {
        var cw = $('canvas').width();
        var cm = $('canvas').css('marginLeft');
        $('.ec_pop .pop_box').css({
            'width': cw,
            'left': cm
        });
    }
}