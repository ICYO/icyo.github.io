(function() {
    "use strict"
    document.addEventListener("DOMContentLoaded", function(event) {
        var wikibody = document.querySelector("#wiki-body");
        var wiki = new WikiContent(wikibody);

        function makeContent(word) {
            var wd = new Wdriver();
            wd.fetch(word, function(list) {
                wikibody.innerText = "";
                var box = new Array();
                var path = word +"/"
                document.querySelector("#word-title").innerText = list.title;
                document.querySelector("#word-small").innerText = list.smalltitle;
                for (var once in list.import) {
                    var realpath = path + list.import[once] + ".dml";
                    box.push(realpath);
                }
                var ptr = (function(box) {
                    var firstpath = box.shift();
                    var prm = wiki.put(firstpath);
                    function swap(box, prm) {
                        if (box.length <= 0) {
                            return 0;
                        }
                        var path = box.shift();
                        var prma = prm.then(function(main) {
                            return wiki.put(path);
                        })
                        if (box.length <= 0) {
                            return 0;
                        }
                        return swap(box, prm);
                    }
                    swap(box, prm);
                });
                if (box.length > 0) {
                    ptr(box);
                }
            });
        } // end makeContent

        var swb = document.getElementById("search-word-btn");
        var wls = document.getElementById("wordlist-search");
        swb.addEventListener("click", function(event) {
            var word = wls.value;
            makeContent(word);
        })
        wls.value = "wiki";
        makeContent("wiki");
        wls.addEventListener("keydown", function(event) {
            if (event.keyCode == 13) {
                swb.click();
            }
        })
    });
}())