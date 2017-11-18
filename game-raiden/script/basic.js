(function() {
    "use strict";
    window.requestAnimationFrame = window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;
    window.cancelAnimationFrame = window.cancelAnimationFrame ||
    window.mozCancelAnimationFrame;
    /**
     * 构造类
     */
    var Mono = new Object();
    Mono.Virtual = {
        node: new Object(),
        show: function() {console.log(Mono.Virtual.node);}
    };

    var regNode = function(node) {
        var swap = {
            _dom: node,
            ID: function(id) {
                if (typeof(Mono.Virtual.node[id]) != "undefined") {
                    throw new Error("Mono 提示: Virtual ID 重复设置");
                    return 0;
                }
                Mono.Virtual.node[id] = swap;
                return swap;
            },
            CSS: function(css) {
                var stl = "";
                for (var once in css) {
                    stl += ";"+once+ ":"+ css[once];
                }
                node.style.cssText += stl + ";";
                return swap;
            },
            Join: function(v) {
                v._dom.appendChild(node);
                return swap;
            },
            Attr: {
                set: function(json) {
                    for (var once in json) {
                        node.setAttribute(once, json[once]);
                    }
                    return swap;
                },
                get: function(key) {
                    /**
                     * 中断方法
                     */
                    return node.attributes[key].value;
                }
            },
            Style: function(key, val) {
                node.style[key] = val;
                return swap;
            },
            Action: function(element, callback) {
                node.addEventListener(element, function(event) {
                    event.preventDefault();
                    callback(event, this);
                });
                return swap;
            }
        };  /* end swap */
        return swap;
    };  /* end regNode */

    Mono.Creater = function(node) {
        var node = document.createElement(node);
        return regNode(node);
    };

    Mono.Get = function(node) {
        var node = document.querySelector(node);
        return regNode(node);
    };

    Mono.VirtualGet = function(vid) {
        var node = Mono.Virtual.node[vid];
        if (typeof(node) == "undefined") {
            throw new Error("Mono 提示: Virtual ID 不存在");
            return 0;
        }
        return node;
    };

    Mono.Random = function(Min, Max) {
        var Range = Max - Min;
        var Rand = Math.random();
        return(Min + Math.round(Rand * Range));
    }

    Mono.Clone = function(obj) {
        var o;
        if (typeof obj == "object") {
            if (obj === null) {
                o = null;
            } else {
                if (obj instanceof Array) {
                    o = new Array();
                    for (var i = 0, len = obj.length; i < len; i++) {
                        o.push(Mono.Clone(obj[i]));
                    }
                } else {
                    o = new Object();
                    for (var j in obj) {
                        o[j] = Mono.Clone(obj[j]);
                    }
                }
            }
        } else {
            o = obj;
        }
        return o;
    }  /* end Clone */

    Mono.Ispc = function() {
        var userAgentInfo = navigator.userAgent;
        var Agents = ["Android", "iPhone",
                    "SymbianOS", "Windows Phone",
                    "iPad", "iPod"];
        var flag = true;
        for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) {
                flag = false;
                break;
            }
        }
        return flag;
    }
    window.Mono = Mono;

    /**
     * canvas 类
     */
    function Canvas(mono) {
        this.dom = (mono._dom);
        this.canvas = this.dom.getContext('2d');
        this.VirtualCounter = 0;
    }

    Canvas.Virtual = new Object();  /* Canvas 块虚拟标志 */
    Canvas.Virtual.Class = new Object();  /* 虚拟类 */
    Canvas.Virtual.ID = new Object();  /* 虚拟唯一标识(只在当前作用域有效) */

    Canvas.prototype.canvasSet = function(callback) {
        callback(this.canvas);
    };

    /**
     * 虚拟块对象
     * 支持矩形和弧型
     */
    Canvas.prototype.BlockInfo = function(info) {
        this.VirtualCounter++;
        var Super = this;
        info._id = Super.VirtualCounter;
        info.Color = function(cl) {
            Super.canvas.beginPath();
            info.color = cl;
            Super.canvas[info.mode + "Style"] = cl;
            if (info.func == "arc") {
                var size = info.r * 2;
                Super.canvas.clearRect(info.left, info.top, size, size);
                Super.canvas.arc(info.left+info.r, info.top+info.r, info.r, 0, info.algo, true);
            } else {
                Super.canvas.rect(info.left, info.top, info.width, info.height);
            }
            Super.canvas[info.mode]();
            Super.canvas.closePath();
            return info;
        };  /* end Color */
        /**
         * 注册事件(json.element)和动作(json.run)
         */
        info.Action = function(json) {
            info.ActionFunc = json.run;
            Super.dom.addEventListener(json.element, function(event) {
                if (event.offsetX >= info.left && event.offsetX <= info.right) {
                    if (event.offsetY >= info.top && event.offsetY <= info.bottom) {
                        info.ActionFunc(event);
                    }
                }
            });
            return info;
        }; /* end Action */

        info.Id = function() {
            return info._id;
        };
        info.CLASS = function(cls) {
            if (typeof(Canvas.Virtual.Class[cls]) == "undefined") {
                Canvas.Virtual.Class[cls] = new Object();
            }
            if (info._id in Canvas.Virtual.Class[cls]) {
                return info;
            }
            Canvas.Virtual.Class[cls][info._id] = info;
            info.class = cls;
            return info;
        };

        info.Move = function(x, y, callback) {
            /* 弧形 */
            var Aframe;
            if (info.func == "arc") {
                var size = info.r * 2 + 4;
                Aframe = function(timestamp) {
                    Super.canvas.clearRect(info.left, info.top, size, size);
                    info.left += x;
                    info.right += x;
                    info.top += y;
                    info.bottom += y;
                    info.X += x;
                    info.Y += y;
                    Super.canvas.beginPath();
                    Super.canvas.arc(info.left+info.r, info.top+info.r, info.r, 0, info.algo, true);
                    Super.canvas[info.mode]();
                    Super.canvas.closePath();
                    info.RAF = requestAnimationFrame(Aframe);
                    callback(info);
                };
            }
            if (info.func == "drawImage") {
                Aframe = function(timestamp) {
                    Super.canvas.clearRect(info.left, info.top, info.width, info.height);
                    info.left += x;
                    info.right += x;
                    info.top += y;
                    info.bottom += y;
                    info.X += x;
                    info.Y += y;
                    Super.canvas.beginPath();
                    Super.canvas.drawImage(info.img, info.left, info.top);
                    Super.canvas.closePath();
                    info.RAF = requestAnimationFrame(Aframe);
                    callback(info);
                }
            }
            info.RAF = requestAnimationFrame(Aframe)
            return info;
        };

        info.Stop = function() {
            cancelAnimationFrame(info.RAF);
            return info;
        };

        info.Clear = function() {
            info.Stop();
            delete Canvas.Virtual.ID[info._id];
            delete Canvas.Virtual.Class[info.class][info._id];
            info.ActionFunc = function(){};
            if (info.func == "arc") {
                var size = info.r * 2;
                Super.canvas.clearRect(info.left, info.top, size, size);
            }
            if (info.func == "drawImage") {
                Super.canvas.clearRect(info.left, info.top, info.width, info.height);
            }
            return info;
        }

        return info;
    };

    /**
     * 画一个弧型(默认是圆)
     */
    Canvas.prototype.Circle = function(info) {
        info.algo = typeof(info.algo) == "undefined" ? (Math.PI * 2) : info.algo;
        this.canvas.beginPath();
        if (info.mode == "fill") {
            this.canvas.fillStyle = info.color;
            this.canvas.arc(info.x, info.y, info.r, 0, info.algo, true);
            this.canvas.fill();
        } else if (info.mode == "stroke") {
            this.canvas.strokeStyle = info.color;
            this.canvas.arc(info.x, info.y, info.r, 0, info.algo, true);
            this.canvas.stroke();
        } else {
            throw new TypeError("Canvas 提示: 渲染模式不合法");
        }
        this.canvas.closePath();
        var bf = {
            func: "arc",
            mode: info.mode,
            algo: info.algo,
            X: info.x,
            Y: info.y,
            r: info.r,
            top: info.y - info.r,
            right: info.x + info.r,
            bottom: info.y + info.r,
            left: info.x - info.r,
            color: info.color,
            image: null,
            text: info.text
        };
        return this.BlockInfo(bf);
    };

    Canvas.prototype.FlashLog = function(info) {
        this.canvas.beginPath();
        this.canvas.font = info.font;
        this.canvas.fillStyle = info.color;
        this.canvas.fillText(info.text, info.x, info.y);
        this.canvas.fill();
        this.canvas.closePath();
        var canvas = this.canvas;
        setTimeout(function() {
            canvas.clearRect(info.x, info.y-info.size, window.screen.availWidth, info.size+25)
            info.then();
        }, info.time);
    };

    Canvas.prototype.Image = function(info) {
        var img = new Image(info.width, info.height);
        img.style.cssText += "width:auto;height:auto;\
        -webkit-border-radius:50%;\
        -moz-border-radius:50%;\
        border-radius:50%;";
        img.src = info.src;
        var canvas = this.canvas;
        img.onload = function() {
            canvas.beginPath();
            canvas.drawImage(img, info.x, info.y);
            canvas.closePath();
        };
        var bf = {
            func: "drawImage",
            img: img,
            mode: null,
            algo: null,
            r: info.width / 2,
            X: info.x + (info.width / 2),
            Y: info.y + (info.height / 2),
            width: info.width,
            height: info.height,
            top: info.y,
            right: info.x + info.width,
            bottom: info.y + info.width,
            left: info.x,
            color: null,
            image: null,
            text: null
        };
        return this.BlockInfo(bf);
    };

    window.Canvas = Canvas;

    /**
     * 动画类
     */
    var RAF;
    function Animation(callback) {
        var Aframe = function(time) {
            RAF = callback(Aframe);
        }
        RAF = requestAnimationFrame(Aframe);
    }
    function CancelAnimation() {
        cancelAnimationFrame(RAF);
    }
    window.Animation = Animation;
    window.CancelAnimation = CancelAnimation;

})();