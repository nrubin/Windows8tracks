// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";
    var app = WinJS.Application;
    var nav = WinJS.Navigation;
    var allMixes = {};

    function getDummyMixData(mixSetName) {
        return {
            name: "Mix",
            escapedCoverUrls: { max200: "url('/media/images/default-mix-thumb.png')" },
            cover_urls: {max200: "/media/images/default-mix-thumb.png"},
            id: "-1",
            mixSetName: mixSetName,
            description: "this is fake"
        }
    }

    function compareMixSetNames(leftName, rightName) {
        return leftName.charCodeAt(0) - rightName.charCodeAt(0);
    }

    function getGroupKey(item) {
        return item.mixSetName;
    }

    function getGroupData(item) {
        return {
            name: item.mixSetName
        };
    }

    function tagMixesWithMixSet(mixes, mixSetName) {
        //tags a mix with the mix set it belongs to (e.g. "latest" or "favorite")
        for (var i = 0; i < mixes.length; i++) {
            var mix = mixes[i];
            mix.mixSetName = mixSetName;
            mix.escapedCoverUrls = {}
            for (var imgName in mix.cover_urls) {
                mix.escapedCoverUrls[imgName] = "url('" + mix.cover_urls[imgName] + "')";//enabled cover urls in css
            }
        }
    }

    function linkMixes(mixes) {
        /*
        I want to know the next item in a mix set, so I'll get to it by turning mix sets into a linked list. This way I can also know if I'm at the end of a mix set (since the last mix won't have a nextMix attr)
        */
        for (var i = 0; i < mixes.length-1; i++) {
            var mix = mixes[i];
            mix.nextMix = mixes[i + 1];
        }
    }

    function addMixToAllMixes(mix) {
        var id = mix.id;
        allMixes[id] = mix;
    }

    function addMixesToAllMixes(mixes) {
        for (var i = 0; i < mixes.length; i++) {
            var mix = mixes[i];
            addMixToAllMixes(mix);
        }
    }
    function testDefaultMixes() {
        var myArray = new Array();
        for (var i = 0; i < 20; i++) {
            myArray.push(getDummyMixData("dummy"));
        }
        renderDefaultMixes(myArray);
    }
    function renderDefaultMixes(mixes) {
        tagMixesWithMixSet(mixes, "dj");
        addMixesToAllMixes(mixes);
        linkMixes(mixes);
        app.sessionState.defaultMixSet = mixes;
        var listView = document.querySelector("#djListView").winControl;
        var dataList = new WinJS.Binding.List(mixes);
        listView.itemDataSource = dataList.dataSource;
    }

    function getRecommendedMixes() {
        console.log("getting recommended mixes");
        Networker.getRecommendedMixes(app.sessionState.userId, "5", "1").then(
            function completed(mixes) {
                renderRecommendedMixList(mixes);
            },
            function errored(response) {
            },
            function progress() {
            });
    }
    function renderRecommendedMixList(mixes) {
        tagMixesWithMixSet(mixes, "recommended");
        addMixesToAllMixes(mixes);
        linkMixes(mixes);
        app.sessionState.recommendedMixSet = mixes;
        var listView = document.querySelector("#recommendedMixesListView").winControl;
        var dataList = new WinJS.Binding.List(mixes);
        listView.itemDataSource = dataList.dataSource;
    }

    function getMixFeedMixes() {
        console.log("getting mix feed");
        Networker.getMixFeed(app.sessionState.userId, "5", "1").then(
            function completed(mixes) {
                renderMixFeedMixList(mixes);
            },
            function errored(response) {
            },
            function progress() {
            });
    }
    function renderMixFeedMixList(mixes) {
        tagMixesWithMixSet(mixes, "mixFeed");
        addMixesToAllMixes(mixes);
        linkMixes(mixes);
        app.sessionState.mixFeedMixSet = mixes;
        var listView = document.querySelector("#mixFeedListView").winControl;
        var dataList = new WinJS.Binding.List(mixes);
        listView.itemDataSource = dataList.dataSource;
    }

    function getListeningHistoryMixes() {
        console.log("getting listening history");
        Networker.getListeningHistory(app.sessionState.userId, "5", "1").then(
            function completed(mixes) {
                renderListeningHistoryMixList(mixes);
            },
            function errored(response) {
            },
            function progress() { 
            });
    }
    function renderListeningHistoryMixList(mixes) {
        tagMixesWithMixSet(mixes, "listeningHistory");
        addMixesToAllMixes(mixes);
        linkMixes(mixes);
        app.sessionState.listeningHistoryMixSet = mixes;
        var listView = document.querySelector("#listeningHistoryListView").winControl;
        var dataList = new WinJS.Binding.List(mixes);
        listView.itemDataSource = dataList.dataSource;
    }

    function getLatestMixes(eventargs) {
        console.log("getting latest mixes....");
        Networker.getLatestMixes("5", "1", renderLatestMixList);
    }
    function renderLatestMixList(mixes) {
        tagMixesWithMixSet(mixes, "latest");
        addMixesToAllMixes(mixes);
        linkMixes(mixes);
        app.sessionState.latestMixSet = mixes;
        var listView = document.querySelector("#latestMixesListView").winControl;
        var dataList = new WinJS.Binding.List(mixes);
        listView.itemDataSource = dataList.dataSource;
    }

    function getFavoriteMixes(eventargs) {
        console.log("getting favorite mixes....");
        Networker.getFavoriteMixes(app.sessionState.userId,"5","1",renderFavoriteMixList);
    }
    function renderFavoriteMixList(mixes) {
        tagMixesWithMixSet(mixes, "favorite");
        app.sessionState.favoriteMixSet = mixes;
        linkMixes(mixes);
        console.log("rendering favorite mixes");
        var listView = document.querySelector("#favoriteMixesListView").winControl;
        var dataList = new WinJS.Binding.List(mixes);
        listView.itemDataSource = dataList.dataSource;
    }

    function playSelectedMix(eventargs) {
        var mixId = eventargs.srcElement.parentNode.parentNode.querySelector(".mix-id").innerText;
        var selectedMix = allMixes[mixId];
        app.sessionState.currentMix = selectedMix;
        nav.navigate("/listen/listen.html");
    }

    function mixesLoaded(eventargs) {
        //add click event listeners
        var listViewDOM = eventargs.srcElement;
        var listViewWinControl = listViewDOM.winControl;
        if (listViewWinControl.loadingState === "complete") {
            var mixes = listViewDOM.querySelectorAll(".mix");
            for (var i = 0; i < mixes.length; i++) {
                var mix = mixes[i];
                mix.addEventListener("click", playSelectedMix);
            }
        }
    }

    function addLoadCompleteEventListenersToListViews( )
    {
        var listViews = document.querySelectorAll(".win-listview");
        for (var i = 0; i < listViews.length; i++) {
            var listView = listViews[i];
            listView.addEventListener("loadingstatechanged", mixesLoaded);
        }
    }


    WinJS.UI.Pages.define("/browse/browse.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            getLatestMixes();
            getFavoriteMixes();
            getListeningHistoryMixes();
            getMixFeedMixes();
            getRecommendedMixes();
            testDefaultMixes();
            //document.querySelector("#getLatestMixes").addEventListener("click", getLatestMixes);
            //document.querySelector("#getFavoriteMixes").addEventListener("click", getFavoriteMixes);
            addLoadCompleteEventListenersToListViews();
            //document.querySelectorAll("[data-win-control='WinJS.UI.ListView']")
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in viewState.
        }
    });
})();
