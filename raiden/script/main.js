function Gameinit() {
    "use strict";
    /**
     * 将 层 注册为 Canvas
     * Canvas 类致力于将绘制元素以块状呈现
     * 按照 z-index 优先级顺序排列
     */
    var backCvs = new Canvas(Mono.VirtualGet("back"));
    var mainCvs = new Canvas(Mono.VirtualGet("main"));
    var trajectoryCvs = new Canvas(Mono.VirtualGet("trajectory"));  /* 弹道 */
    var handleCvs = new Canvas(Mono.VirtualGet("handle"));  /* 特效 */

    /**
     * 创建 Worker 对象,用于碰撞计算
     */
    var worker1_blob = new Blob([document.getElementById("shoot-worker-a").textContent]);
    var AlienUrl = window.URL.createObjectURL(worker1_blob);

    /**
     * 动态背景地图
     */
    backCvs.canvasSet(function(cvs) {
        var img = new Image();
        img.src = "/raiden/static/image/back3.jpg",
        img.style.height = window.screen.availHeight+"px";
        img.onload = function() {
            var y = -200;
            setInterval(function() {
                y++;
                if (y >= 0) {
                    y = -200;
                }
                cvs.beginPath();
                cvs.drawImage(img, 0, y);
                cvs.closePath();
            }, 200);
        };
    });

    window.Boom = function(x, y) {
        var boom = handleCvs.Image({
            src: "/raiden/static/image/boom.png",
            x: x,
            y: y,
            width: 48,
            height: 48
        }).CLASS("boom")
        setTimeout(function() {
            boom.Clear();
        }, 200);
    }
    /**
     * 子弹
     * @param {Object} play 为子弹初始化和运动提供信息
     */
    function CraftShoot(play) {
        PlayAudio("soundShoot");
        var blockArc = trajectoryCvs.Circle({
            mode: "fill",
            color: "#FF8C00",
            algo: Math.PI * 2,
            x: play.beginX,
            y: play.beginY,
            r: 4
        }).CLASS("bullet")
        .Move(play.moveX, play.moveY, function(info) {
            /* info 就是子弹, 子弹就是 info */
            var pointX = info.X;
            var pointY = info.Y;
            var cls = Canvas.Virtual.Class["mainAlien"];
            setTimeout(function() {
                for (var once in cls) {
                    var onceX = cls[once]["X"];
                    var onceY = cls[once]["Y"];
                    /* 三角公式 */
                    var swap = Math.pow(
                        Math.abs(pointX - cls[once]["X"]), 2
                    ) + Math.pow(
                        Math.abs(pointY - cls[once]["Y"]), 2
                    );
                    if (Math.sqrt(swap) < 20) {
                        /* 发生碰撞 */
                        setTimeout(function() {
                            Protect.KillCount++;
                            TakeNum();
                        }, 10);
                        Boom(cls[once]["left"], cls[once]["top"]);
                        PlayAudio("soundBoom");
                        var vid = cls[once]["Id"]();
                        clearInterval(Protect.Interval.ID[vid]);
                        delete Protect.Interval.ID[vid];
                        cls[once].Clear();
                        info.Clear();
                        break;
                    }
                    
                }
                if (info.top <= 0) {
                    info.Clear();
                }
            }, 10);
        });
    }  /* end CraftShoot */
    /**
     * 飞船
     */
    PlayAudio("soundInit");
    var Craft = mainCvs.Image({
        src: "/raiden/static/image/craft-main.png",
        x: window.screen.availWidth / 2 - 24,
        y: window.screen.availHeight - 108,
        width: 48,
        height: 48
    }).CLASS("mainCraft");
    /* 飞船运动完全交给 Animation 控制 */
    var CraftServe = Animation(function(Aframe) {
        if (Protect.TimeShoot == 1) {
            CraftShoot({
                beginX: Craft.left + 24,
                beginY: Craft.top,
                moveX: 0,
                moveY: -4,
            });
            Protect.TimeShoot = 0;
        }
        mainCvs.canvas.clearRect(Craft.left, Craft.top, Craft.width, Craft.height);
        if (Craft.left <= 0) {
            if (RockerStep.state == "left") {
                RockerStep.left = 0;
                RockerStep.right = 0;
            }
        } else if (Craft.right >= window.screen.availWidth) {
            if (RockerStep.state == "right") {
                RockerStep.left = 0;
                RockerStep.right = 0;
            }
        }
        if (Craft.top <= 0) {
            if (RockerStep.state == "up") {
                RockerStep.top = 0;
                RockerStep.bottom = 0;
            }
        } else if (Craft.bottom >= window.screen.availHeight) {
            if (RockerStep.state == "down") {
                RockerStep.top = 0;
                RockerStep.bottom = 0;
            }
        }
        Craft.top += RockerStep.top;
        Craft.bottom += RockerStep.bottom;
        Craft.left += RockerStep.left;
        Craft.right += RockerStep.right;
        Craft.X += RockerStep.left;
        Craft.Y += RockerStep.top;
        mainCvs.canvas.beginPath();
        mainCvs.canvas.drawImage(Craft.img, Craft.left, Craft.top);
        mainCvs.canvas.closePath();
        return requestAnimationFrame(Aframe);
    });

    function Shoot(play) {
        var AlienShootWorker = new Worker(AlienUrl);  /* 创建 Worker */
        var blockArc = trajectoryCvs.Circle({
            mode: "fill",
            color: "#FF8C00",
            algo: Math.PI * 2,
            x: play.beginX,
            y: play.beginY,
            r: 4
        });
        Protect.Workers[blockArc.Id()] = AlienShootWorker; /* 维护 Worker */
        blockArc.CLASS("bullet")
        .Move(play.moveX, play.moveY, function(info) {
            /* 用 worker 线程计算 */
            AlienShootWorker.postMessage({
                ix: info.X,
                cx: Craft.X,
                iy: info.Y,
                cy: Craft.Y,
                left: Craft.left,
                top: Craft.top,
                vid: null
            });
            AlienShootWorker.onmessage = function(evt) {
                var dist = evt.data.dist;
                if (dist < 28) {
                    /* 碰撞 */
                    setTimeout(function() {
                        Boom(Craft.left, Craft.top);
                        PlayAudio("soundBoom");  /* 击中飞船 */
                        Hurt();
                    }, 10);
                    AlienShootWorker.terminate();
                    delete Protect.Workers[blockArc.Id()];
                    info.Clear();
                }
            };
            if (info.top >= play.desc) {
                AlienShootWorker.terminate();
                delete Protect.Workers[blockArc.Id()];
                info.Clear();
            }
        });
    }

    /**
     * 外星飞船方法
     */
    function Alien(opt) {
        var tm = 1;
        var mc = mainCvs.Image({
            src: opt.src,
            x: opt.beginX,
            y: opt.beginY,
            width: 32,
            height: 32
        }).CLASS("mainAlien");
        var vid = mc.Id()
        Protect.Interval.ID[vid] = setInterval(function() {
            tm = 1;
        }, 1000);  /* 射击频率 */
        mc.Move(opt.moveX, opt.moveY, function(info) {
            if (tm == 1) {
                Shoot({
                    beginX: info.left + 16,
                    beginY: info.bottom,
                    moveX: 0,
                    moveY: 4,
                    desc: window.screen.availHeight
                });
                tm = 0;
            }
            if (info.top >= window.screen.availHeight) {
                tm = 0;
                clearInterval(Protect.Interval.ID[vid]);
                delete Protect.Interval.ID[vid];
                info.Clear();
            }
        });
    }

    /**
     * 外星飞船驱动
     */
    var Demarcation= window.screen.availWidth / 2;
    Protect.Interval.alienItv = setInterval(function() {
        var bx = Mono.Random(1, window.screen.availWidth);
        var mx = -(Mono.Random(0, 4))
        if (bx < Demarcation) {
            mx = Mono.Random(0, 3);
        }
        Alien({
            src: "/raiden/static/image/alien1.png",
            beginX: bx,
            beginY: 0,
            moveX: mx,
            moveY: 2
        });
    }, 2000);

}
(function() {
    var img = new Array();
    img.push("/raiden/static/image/back3.jpg");
    img.push("/raiden/static/image/boom.png");
    img.push("/raiden/static/image/craft-main.png");
    img.push("/raiden/static/image/alien1.png");
    var swap = new Image()
    swap.src = img[0];
    swap.onload = function(_) {
        var swap = new Image()
        swap.src = img[1];
        swap.onload = function(_) {
            var swap = new Image()
            swap.src = img[2];
            swap.onload = function(_) {
                var swap = new Image()
                swap.src = img[3];
                swap.onload = function(_) {
                    Gameinit();
                }
            }
        }
    }
}());