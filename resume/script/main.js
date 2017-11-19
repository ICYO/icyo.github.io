"use strict"

document.addEventListener("DOMContentLoaded", function(event) {
    var real_head = new Image();
    real_head.src = "/resource/resume/head.png";
    real_head.onload = function(e) {
        var head_box = document.querySelector(".info-box-right");
        head_box.innerText = "";
        head_box.appendChild(real_head);
    }
    function dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }

    function diasuccess() {
        var dia = document.getElementById("diasuccess");
        dia.style.display = "block";
        setTimeout(function() {
            dia.style.display = "none";
        }, 2000);
    }

    var btn = document.getElementById("download-image");
    var dom = document.getElementById("main");
    btn.addEventListener("click", function(event) {
        scrollTo(0,0);
        diasuccess();
        html2canvas(dom).then(function(canvas) {
            console.log(canvas);
            try {
                var cvsurl = canvas.toDataURL('image/png', 1);
                var blob = dataURLtoBlob(cvsurl)
            } catch(e) {
                alert(e);
            }
            var aLink = document.createElement('a');
            aLink.download = "resume.png";
            aLink.href = URL.createObjectURL(blob);
            aLink.click();
        });
    });
});