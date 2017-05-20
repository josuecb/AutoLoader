/**
 * Created by Josue on 5/17/2017.
 */
var Queue = (function () {
    function Queue() {
        var a = [];

        this.insert = function (e) {
            a.push(e);
        };

        this.remove = function () {
            return a.splice(0, 1)[0];
        };

        this.peek = function () {
            return a[0];
        };

        this.getList = function () {
            return a;
        };

        this.size = function () {
            return a.length;
        };

        this.empty = function () {
            return this.size() <= 0;
        };
    }

    return Queue;
})();

var EventListener = (function () {
    function EventListener() {
        this.events = [];
        this.eArgs = [];
    }

    EventListener.prototype = {
        /**
         * Calls the event to do something
         * @param eventName
         * @param fn
         * @returns {string}
         */
        bind: function (eventName, fn) {
            if (this.events[eventName] == null) {
                this.events[eventName] = [];
            }

            var id = Math.random().toString(36).replace(/[^a-z0-9]+/g, '').substring(0, 8);
            this.events[eventName][id] = {
                id: id,
                callback: fn
            };

            return id;
        },

        /**
         * This creates the event
         * @param eventName
         * @param args
         */
        call: function (eventName, args) {
            this.eArgs[eventName] = args;
            if (this.events[eventName] != null) {
                for (var x in this.events[eventName]) {
                    this.events[eventName][x].callback(this.eArgs[eventName]);
                }
            }
        },

        unbind: function (eventName, id) {
            if (this.events[eventName] != null) {
                delete (this.events[eventName][id]);
            }
        }
    };

    return EventListener;
})();


var evl = new EventListener();

var AutoLoader = (function () {
    function AutoLoader(ConfigURI, extraPath) {
        var s = this;
        var qLink = new Queue();

        this.configURI = ConfigURI + "?" + Date.parse("" + new Date());
        if (window.location.hostname !== "localhost")
            this.hostname = "http://" + window.location.hostname;
        else
            this.hostname = "";

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

        this.load = function (dir, tree, debug) {
            var t = this.tree;

            if (tree !== undefined)
                t = tree;

            for (var dirs in t) {
                if (t instanceof Array) {
                    for (var i = 0; i < t.length; i++) {
                        var l = s.hostname + dir + "/" + t[i] + ".js?" + Date.parse("" + new Date());
                        qLink.insert(l);
                        if (debug)
                            console.log("Added to queue: " + l);
                    }

                    return;
                } else if (t instanceof Object) {
                    if (dir !== undefined)
                        this.load(dir + "/" + dirs, t[dirs], debug);
                    else
                        this.load(dirs, t[dirs], debug);
                }
            }

        };

        this.import = function (debug) {
            var allowToDownload = true;
            if (debug) {
                setTimeout(function () {
                    if (allowToDownload) {
                        s.download(qLink.remove());
                        allowToDownload = false;
                        if (!qLink.empty())
                            s.import(debug);
                    } else {
                        clearTimeout(this);
                        if (!qLink.empty())
                            s.import(debug);
                    }
                }, 1);
            }

            evl.bind('scriptLoader', function (args) {
                allowToDownload = args;
            });
        };

        this.download = function (l, debug) {
            if (debug)
                console.log("Added: " + l);

            var e = document.createElement("script");
            e.setAttribute("src", l);
            e.setAttribute("onload", "evl.call('scriptLoader',true);");
            document.getElementsByTagName("body")[0].appendChild(e);
        }
    }


    return AutoLoader;
})();