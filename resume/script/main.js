"use strict"

document.addEventListener("DOMContentLoaded", function(event) {
    if (document.body.clientWidth < 600) {
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href="/resume/style/mobile.css";
        document.head.appendChild(link);
    } else {
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href="/resume/style/main.css";
        document.head.appendChild(link);
    }

    function dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }

    var btn = document.getElementById("download-image");
    var dom = document.getElementById("main");
    btn.addEventListener("click", function(event) {
        html2canvas(dom).then(function(canvas) {
            var blob = dataURLtoBlob(canvas.toDataURL('image/png', 1))
            var aLink = document.createElement('a');
            aLink.download = "resume.png";
            aLink.href = URL.createObjectURL(blob);
            console.log(aLink.href);
            aLink.click();
        });
    });
});