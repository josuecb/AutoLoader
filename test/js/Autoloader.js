/**
 * Created by Josue on 5/17/2017.
 */
var AutoLoader = (function () {
    function AutoLoader(ConfigURI, extraPath) {
        var s = this;

        this.configURI = ConfigURI + "?" + Date.parse("" + new Date());
        this.hostname = "http://" + window.location.hostname;
        this.hostname += (extraPath !== undefined ? extraPath : "");

        this.hostname += "/";
        this.tree = null;

        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", this.configURI, false);
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                s.tree = JSON.parse(xmlHttp.responseText).tree;
            } else {
                console.log("An error occurred downloading config file");
            }
        };

        xmlHttp.send();

        this.import = function (dir, tree, debug) {
            var t = this.tree;

            if (tree !== undefined)
                t = tree;

            for (var dirs in t) {
                if (t instanceof Array) {
                    for (var i = 0; i < t.length; i++) {
                        var e = document.createElement("script");
                        e.setAttribute("src", this.hostname + dir + "/" + t[i] + ".js?" + Date.parse("" + new Date()));
                        document.getElementsByTagName("body")[0].appendChild(e);
                        if (debug) {
                            console.log("Added: " + this.hostname + dir + "/" + t[i] + ".js?" + Date.parse("" + new Date()));
                        }
                    }
                    return;
                } else if (t instanceof Object) {
                    if (dir !== undefined)
                        this.import(dir + "/" + dirs, t[dirs], debug);
                    else
                        this.import(dirs, t[dirs], debug);
                }
            }

        }
    }


    return AutoLoader;
})();