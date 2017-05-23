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
        var loaded = false;

        this.configURI = ConfigURI + "?" + Date.parse("" + new Date());
        if (window.location.hostname !== "localhost")
            this.hostname = "http://" + window.location.hostname;
        else
            this.hostname = "";

        this.hostname += (extraPath !== undefined ? extraPath : "");
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

        this.load = function (debug, dir, tree) {
            var t = this.tree;

            if (tree !== undefined)
                t = tree;

            for (var dirs in t) {
                if (t instanceof Array) {
                    for (var i = 0; i < t.length; i++) {
                        var l = s.hostname + dir + ((dir[dir.length - 1] === "/") ? "" : "/") + t[i] + ".js?" + Date.parse("" + new Date());
                        qLink.insert(l);
                        if (debug)
                            console.log("Added to queue: " + l);
                    }

                    return;
                } else if (t instanceof Object) {
                    this.load(debug, ((dir === undefined) ? (s.hostname[s.hostname.length - 1] === "/") ? "" : ("/") : dir + "/") + dirs, t[dirs]);
                }
            }

        };

        this.import = function (debug) {
            if (!qLink.empty())
                s.download(qLink.remove(), debug);

            evl.bind('scriptLoader', function (args) {
                if (!qLink.empty())
                    s.download(qLink.remove(), debug);
            });
        };


        this.download = function (path, debug) {
            var done = false;
            var scr = document.createElement('script');

            scr.onload = handleLoad;
            scr.onreadystatechange = handleReadyStateChange;
            scr.onerror = handleError;
            scr.src = path;
            document.body.appendChild(scr);

            function handleLoad() {
                if (!done) {
                    done = true;
                    if (debug)
                        console.log("ok: " + path);
                    evl.call('scriptLoader', true);
                }
            }

            function handleReadyStateChange() {
                var state;

                if (!done) {
                    state = scr.readyState;
                    if (state === "complete") {
                        handleLoad();
                    }
                }
            }

            function handleError() {
                if (!done) {
                    done = true;
                    if (debug)
                        console.log("error" + path);
                }
            }
        };
    }


    return AutoLoader;
})();