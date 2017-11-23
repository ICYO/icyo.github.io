(function() {
    "use strict"
    document.addEventListener("DOMContentLoaded", function(event) {
        var wiki = new WikiContent(document.querySelector("#wiki-body"));

        wiki.put("/wiki/home/about-wiki.dml")
        .then(function(main) {
            return wiki.put("/wiki/home/about-wiki.dml")
        })
        .then(function(main) {
            return wiki.put("/wiki/home/about-wiki.dml")
        })
    });
}())