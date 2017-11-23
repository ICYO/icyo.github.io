(function() {
    "use strict"
    document.addEventListener("DOMContentLoaded", function(event) {
        var work = new Array();

        work.push(new WikiContent({
            id: "about-wiki",
            title: "有关 Joshuas's wiki",
            content: "/wiki/home/about-wiki.txt",
            author: [
                "Joshuas"
            ],
            dom: document.querySelector("#wiki-body")
        }));
    });
}())