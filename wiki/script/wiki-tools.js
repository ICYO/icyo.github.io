(function() {
    "use strict"

    function loadXML(xmlString){
        var xmlDoc=null;
        //支持IE浏览器 
        if(!window.DOMParser && window.ActiveXObject){   //window.DOMParser 判断是否是非ie浏览器
            var xmlDomVersions = ['MSXML.2.DOMDocument.6.0','MSXML.2.DOMDocument.3.0','Microsoft.XMLDOM'];
            for(var i=0;i<xmlDomVersions.length;i++){
                xmlDoc = new ActiveXObject(xmlDomVersions[i]);
                xmlDoc.async = false;
                xmlDoc.loadXML(xmlString); //loadXML方法载入xml字符串
                break;
            }
        }
        //支持Mozilla浏览器
        else if(window.DOMParser && document.implementation && document.implementation.createDocument){
            var domParser = new  DOMParser();
            xmlDoc = domParser.parseFromString(xmlString, 'text/xml');
        }
        else {
            return null;
        }
        this.xmldoc = xmlDoc;
    }

    loadXML.prototype.getXmlElement = /**@method */function(domstring) {
        return this.xmldoc.getElementsByTagName(domstring)[0].firstChild.nodeValue;
    }

    var tran = function(str) {
        var swap;
        swap = str.replace(/{a[\s]+href="(.+?)"}/g, "<a href=\"$1\">");
        swap = swap.replace(/{\/a}/g, "</a>");
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
                xhr.setRequestHeader("Accept","text/xml");
                xhr.onreadystatechange = function () {
                    if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                        var data = xhr.response;
                        var xmldoc= new loadXML(data);
                        var title = xmldoc.getXmlElement("Title");
                        var id = xmldoc.getXmlElement("ID");
                        var content = tran(xmldoc.getXmlElement("Content"));
                        var author = xmldoc.getXmlElement("Author");
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