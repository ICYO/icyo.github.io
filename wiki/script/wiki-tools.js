(function() {
    "use strict"

    var TextTool = new Object();
    TextTool.img = function(text, href) {
        var path = '/resource'+location.pathname+'image/'+href;
        var img = '<img src="'+path+'" alt="'+text+'" title="'+text+'" />';
        return img;
    }
    TextTool.link = function(text, href) {
        var path = '/wiki/'+href;
        var a = '<a href="'+path+'">'+text+'</a>';
        return a;
    }

    function Content(json) {
        console.log(json);
        this.Title = json.title ? json.title : null;
        this.Content = json.content ? json.content : null;
        this.Author = json.author;
        this.dom = json.dom;
        var main = document.createElement("div");
        main.setAttribute("id", json.id);
        main.style.cssText += ";width:100%;float:left;height:auto;margin:1rem 0 1rem 0;";
        var t = document.createElement("div");
        t.style.cssText += ";width:100%;float:left;height:30px;font-weight:nomal;font-size:20px;\
            line-height:30px;text-align:left;color:#000;border-bottom:1px solid #AAA;";
        t.innerText = this.Title;
        var c = document.createElement("div");
        c.style.cssText += ";width:100%;float:left;height:auto;word-wrap:break-word;\
            line-height:2;font-size:14px;color:#333;";
        
        fetch(this.Content, {
            method: "GET"
        }).then(function(res) {
            return res.text();
        }).then(function(data) {
            c.innerHTML = data;
        })
        main.appendChild(t);
        main.appendChild(c);
        json.dom.appendChild(main);
    }
    window.WikiContent = Content;
}())