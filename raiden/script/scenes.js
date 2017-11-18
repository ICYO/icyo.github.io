(function() {
    "use strict";
    if (Mono.Ispc()) {
        alert("请用手机玩耍");
    }
    /**
     * 游戏主体
     */
    window.Protect = new Object();
    Protect.Interval = new Object();  /* 维护动态事件 */
    Protect.TimeShoot;  /* 子弹发射判定(1为发射0为禁止) */
    Protect.Interval.ID = new Object();  /* 以虚拟id形式维护计时器句柄 */
    Protect.Workers = new Object();  /* 以虚拟id形式维护计算线程对象 */
    Protect.KillCount = 0;  // 击杀数量
    /* 游戏背景层 */
    Mono.Creater("canvas").CSS({
        background: "#AAA",
        position: "fixed",
        top: 0,
        left: 0,
        "z-index": "1"
    }).ID("back").Attr.set({
        width: window.screen.availWidth,
        height: window.screen.availHeight
    }).Join(Mono.Get("#main"));
    /* 游戏主体层 */
    Mono.Creater("canvas").CSS({
        position: "fixed",
        top: 0,
        left: 0,
        "z-index": "2"
    }).ID("main").Attr.set({
        width: window.screen.availWidth,
        height: window.screen.availHeight
    }).Join(Mono.Get("#main"));
    /* 游戏特效层 */
    Mono.Creater("canvas").CSS({
        position: "fixed",
        top: 0,
        left: 0,
        "z-index": "4"
    }).ID("handle").Attr.set({
        width: window.screen.availWidth,
        height: window.screen.availHeight
    }).Join(Mono.Get("#main"));
    /* 游戏弹道专用层 */
    Mono.Creater("canvas").CSS({
        position: "fixed",
        top: 0,
        left: 0,
        "z-index": "3"
    }).ID("trajectory").Attr.set({
        width: window.screen.availWidth,
        height: window.screen.availHeight
    }).Join(Mono.Get("#main"));
    /* 游戏界面层 */
    Mono.Creater("canvas").CSS({
        position: "fixed",
        top: 0,
        left: 0,
        "z-index": "100"
    }).ID("interface").Attr.set({
        width: window.screen.availWidth,
        height: window.screen.availHeight
    }).Join(Mono.Get("#main"));
    /* 血条 */
    Mono.Creater("div").CSS({
        position: "fixed",
        top: "10px",
        left: "0",
        width: "100%",
        height: "30px",
        "z-index": "300"
    }).ID("showblock")
    .Join(Mono.Get("#main"));

    var tlong = window.screen.availWidth * 0.7;
    Mono.Creater("div").CSS({
        background: "rgba(120,204,51,.8)",
        position: "relative",
        float: "left",
        left: "15%",
        width: "70%",
        height: "10px",
        "z-index": "300"
    }).ID("tiao")
    .Attr.set({blood: tlong})
    .Join(Mono.VirtualGet("showblock"));

    function hurt() {
        var bd = Mono.VirtualGet("tiao");
        var dom = bd._dom;
        var blo = bd.Attr.get("blood");
        var nowblo = blo - Math.floor(tlong / 20);
        bd.Attr.set({blood:nowblo})
        bd.Style("width", nowblo + "px");
        if (nowblo <= 0) {
            GameOver();
        }
    }
    window.Hurt = hurt;
    /* 遥杆 */
    Mono.Creater("div").CSS({
        background: "rgba(255,255,255,.3)",
        "-webkit-border-radius": "50%",
        "-moz-border-radius": "50%",
        "border-radius": "50%",
        "transform": "rotate(45deg)",
        "-webkit-transform": "rotate(45deg)",
        "-moz-transform": "rotate(45deg)",
        position: "fixed",
        left: "10px",
        width: "150px",
        height: "150px",
        bottom: "10px",
        "z-index": "200"
    }).ID("rocker")
    .Join(Mono.Get("#main"));

    function slite(t) {
        t.style.background = "rgba(0,51,102,.5)";
    }
    function oslite(t) {
        t.style.background = "rgba(25,25,25,.3)";
    }
    /* 摇杆键位的css */
    var rockerPice = {
        background: "rgba(25,25,25,.3)",
        float: "left",
        position: "relative",
        width: "73px",
        height: "73px",
        border:"1px solid #AAA",
        "z-index": "201"
    }
    window.RockerStep = new Object();
    RockerStep.left = 0;
    RockerStep.right = 0;
    RockerStep.top = 0;
    RockerStep.bottom = 0;
    RockerStep.state = "hold";
    var speed = 3;
    /* 摇杆上部 */
    Mono.Creater("div").CSS(rockerPice).CSS({
        "-webkit-border-top-left-radius": "100%",
        "-moz-border-top-left-radius": "100%",
        "border-top-left-radius": "100%",
    })
    .ID("rockerTop")
    .Join(Mono.VirtualGet("rocker"))
    .Action("touchstart", function(event, t) {
        slite(t);
        RockerStep.state = "up";
        RockerStep.top = RockerStep.bottom = - speed;
    }).Action("touchend", function(event, t) {
        oslite(t);
        RockerStep.state = "hold";
        RockerStep.top = RockerStep.bottom = 0;
    });
    /* 摇杆右部 */
    Mono.Creater("div").CSS(rockerPice).CSS({
        "-webkit-border-top-right-radius": "100%",
        "-moz-border-top-right-radius": "100%",
        "border-top-right-radius": "100%",
    })
    .ID("rockerRight")
    .Join(Mono.VirtualGet("rocker"))
    .Action("touchstart", function(event, t) {
        slite(t);
        RockerStep.state = "right";        
        RockerStep.left = RockerStep.right = speed;
    }).Action("touchend", function(event, t) {
        oslite(t);
        RockerStep.state = "hold";        
        RockerStep.left = RockerStep.right = 0;
    });
    /* 摇杆左部 */
    Mono.Creater("div").CSS(rockerPice).CSS({
        "-webkit-border-bottom-left-radius": "100%",
        "-moz-border-bottom-left-radius": "100%",
        "border-bottom-left-radius": "100%",
    })
    .ID("rockerLeft")
    .Join(Mono.VirtualGet("rocker"))
    .Action("touchstart", function(event, t) {
        slite(t);
        RockerStep.state = "left";
        RockerStep.left = RockerStep.right = - speed;
    }).Action("touchend", function(event, t) {
        oslite(t);
        RockerStep.state = "hold";        
        RockerStep.left = RockerStep.right = 0;
    });
    /* 摇杆下部 */
    Mono.Creater("div").CSS(rockerPice).CSS({
        "-webkit-border-bottom-right-radius": "100%",
        "-moz-border-bottom-right-radius": "100%",
        "border-bottom-right-radius": "100%",
    })
    .ID("rockerBottom")
    .Join(Mono.VirtualGet("rocker"))
    .Action("touchstart", function(event, t) {
        slite(t);
        RockerStep.state = "down";
        RockerStep.top = RockerStep.bottom = speed;
    }).Action("touchend", function(event, t) {
        oslite(t);
        RockerStep.top = RockerStep.bottom = 0;
        RockerStep.state = "hold";
    });
    /* 摇杆部分结束 */

    /* 子弹发射控制 */
    var ShootLock = false;
    Mono.Creater("div").CSS({
        background: "rgba(255,255,255,.3)",
        "-webkit-border-radius": "50%",
        "-moz-border-radius": "50%",
        "border-radius": "50%",
        width: "70px",
        height: "70px",
        position: "fixed",
        left: "auto",
        top: "auto",
        right: "10px",
        bottom: "10px",
        "z-index": "201"
    }).ID("shoot")
    .Join(Mono.Get("#main"))
    .Action("touchstart", function(event) {
        Mono.VirtualGet("shoot").Style("background", "rgba(255,69,0,.3)");
        if (ShootLock == false) {
            ShootLock = true;
            Protect.TimeShoot = 1
            setTimeout(function() {  /* 0.5秒后解锁 */
                ShootLock = false;
            }, 500);
        }
        Protect.Interval.craftShoot = setInterval(function() {
            Protect.TimeShoot = 1;
        }, 500);
    }).Action("touchend", function(event) {
        Protect.TimeShoot = 0;
        clearInterval(Protect.Interval.craftShoot);
        Mono.VirtualGet("shoot").Style("background", "rgba(255,255,255,.3)");
    });

    /**
     * 音效
     */
    window.PlayAudio = function(vid) {
        var ad = Mono.VirtualGet(vid)._dom;
        ad.pause();
        ad.currentTime = 0.0;
        ad.play();
    }
    /* 射击 */
    Mono.Creater("audio")
    .Attr.set({
        preload: "auto",
        src: "/raiden/static/sound/shoot.ogg",
        volume: ".3"
    }).ID("soundShoot");
    /* 爆炸 */
    Mono.Creater("audio")
    .Attr.set({
        preload: "auto",
        volume: ".3",
        src: "/raiden/static/sound/boom.ogg"
    })
    .ID("soundBoom");
    /* 初始化音效 */
    Mono.Creater("audio")
    .Attr.set({
        preload: "auto",
        volume: ".3",
        src: "/raiden/static/sound/init.ogg"
    })
    .ID("soundInit");
})();