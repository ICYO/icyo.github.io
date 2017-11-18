(function() {
    "use strict";
    /**
     * 界面提示与特效展示接口
     */
    /* interface 层 */
    var interfaceCvs = new Canvas(Mono.VirtualGet("interface"));

    interfaceCvs.FlashLog({
        text: "请使用方向按钮控制飞机",
        x: window.screen.availWidth / 2 - 143,
        y: window.screen.availHeight / 2 - 50,
        font: "25px Arial",
        color: "#FF6633",
        size: 30,
        time: 2000,
        then: function() {
            interfaceCvs.FlashLog({
                text: "请使用右侧按钮开火",
                x: window.screen.availWidth / 2 - 120,
                y: window.screen.availHeight / 2 - 50,
                font: "25px Arial",
                color: "#FF6633",
                size: 30,
                time: 2000,
                then: function() {}
            });
        }
    });

    window.TakeNum = function() {
        if (Protect.KillCount % 5 == 0) {
            interfaceCvs.FlashLog({
                text: "完成 "+ Protect.KillCount + "连杀成就!",
                x: window.screen.availWidth / 2 - 95,
                y: window.screen.availHeight / 2 - 50,
                font: "25px Arial",
                color: "#FF6633",
                size: 30,
                time: 2000,
                then: function() {}
            });
        }
    };

    window.GameOver = function() {
        interfaceCvs.FlashLog({
            text: "GAME OVER",
            x: window.screen.availWidth / 2 - 65,
            y: window.screen.availHeight / 2 - 50,
            font: "25px Arial",
            color: "#FF6633",
            size: 30,
            time: 4000,
            then: function() {
                CancelAnimation();
            }
        });
        clearInterval(Protect.Interval.alienItv);
        for (var once in Protect.Interval.ID) {
            clearInterval(Protect.Interval.ID[once]);
            delete Protect.Interval.ID[once];
        }
        for (var once in Protect.Workers) {
            Protect.Workers[once].terminate();
            delete Protect.Workers[once];
        }
        for (var once in Canvas.Virtual.ID) {
            Canvas.Virtual.ID[once].Clear();
        }
        for (var once in Canvas.Virtual.Class) {
            var swap = Canvas.Virtual.Class;
            for (var key in swap[once]) {
                swap[once][key].Clear();
            }
        }
        Protect.KillCount = 0;
    };

})();