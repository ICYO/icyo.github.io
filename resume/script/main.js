"use strict"

document.addEventListener("DOMContentLoaded", function(event) {
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
            document.body.appendChild(canvas);
            try {
                var blob = dataURLtoBlob(canvas.toDataURL('image/png', 1))
            } catch(e) {
                alert(e);
            }
            var aLink = document.createElement('a');
            aLink.download = "resume.png";
            aLink.href = URL.createObjectURL(blob);
            alert(aLink.href);
            aLink.click();
        });
    });
});