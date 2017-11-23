(function() {
    "use strict"

    function loadSign(str) {
        var el = document.createElement( 'div' );  
        el.innerHTML = str;  
        this.box = el;
    }
    loadSign.prototype.getTag = function(dom) {
        return this.box.querySelector(dom).innerHTML;
    }

    var trans = function(str) {
        console.log(str);
        var swap;
        swap = str
        .replace(/<code>/g, "<pre class=\"wiki-code\">")
        .replace(/<\/code>/g, "</pre>")
        return swap;
    }

    function Content(dom) {
        this.dom = dom;
    }
    Content.prototype.put = function(ping) {
        var that = this;
        return new Promise(function(resolve, reject) {
            var main = document.createElement("div");
            main.style.cssText += ";width:100%;float:left;height:auto;margin:1rem 0 1rem 0;";
            var t = document.createElement("div");
            t.style.cssText += ";width:100%;float:left;height:30px;font-weight:nomal;font-size:20px;\
                line-height:30px;text-align:left;color:#000;border-bottom:1px solid #AAA;";
            var c = document.createElement("div");
            c.style.cssText += ";width:100%;float:left;height:auto;word-wrap:break-word;\
                line-height:2;font-size:14px;color:#333;";
            var em = document.createElement("em");
            em.style.cssText += ";display:block;float:right;height:30px;font-weight:nomal;font-size:14px;line-height:30px;color:#777;";
            // 请求xml文档
            /**@method */(function(ping) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', ping, true);
                xhr.setRequestHeader("Accept","application/xhtml+xml");
                xhr.onreadystatechange = function () {
                    if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                        var data = xhr.response;
                        var xmldoc= new loadSign(data);
                        var title = xmldoc.getTag("Title");
                        var title = xmldoc.getTag("Title");
                        var id = xmldoc.getTag("ID");
                        var content = trans(xmldoc.getTag("Content"));
                        var author = xmldoc.getTag("Author");
                        main.setAttribute("id", id);
                        t.innerText = title;
                        em.innerHTML = "by: " + author;
                        c.innerHTML = content;
                        t.appendChild(em);
                        main.appendChild(t);
                        main.appendChild(c);
                        that.dom.appendChild(main);
                        resolve(main);
                    }
                }
                xhr.onerror = function(error) {
                    reject(error);
                }
                xhr.send(null);
            }(ping))
        });  // end promise
    }
    window.WikiContent = Content;
}())