// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";
    var app = WinJS.Application;
    var nav = WinJS.Navigation;
    var allMixes = {};
    var globalMixList = new WinJS.Binding.List();
    var tagsToTitles = {
        "favorite": "Liked By You",
        "latest": "Featured",
        "listeningHistory": "Listening History",
        "recommended": "Recommeded For You"
    }

    function getDummyMixData(mixSetName) {
        return {
            name: "Mix",
            escapedCoverUrls: { max200: "url('/media/images/default-mix-thumb.png')" },
            cover_urls: { max200: "/media/images/default-mix-thumb.png" },
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
            name: tagsToTitles[item.mixSetName]
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
        for (var i = 0; i < mixes.length - 1; i++) {
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
        var str = "latest";
        for (var i = 0; i < 5; i++) {
            myArray.push(getDummyMixData(str));
        }
        var str = "favorite";
        for (var i = 0; i < 5; i++) {
            myArray.push(getDummyMixData(str));
        }
        var str = "listeningHistory";
        for (var i = 0; i < 5; i++) {
            myArray.push(getDummyMixData(str));
        }
        var str = "recommended";
        for (var i = 0; i < 5; i++) {
            myArray.push(getDummyMixData(str));
        }
        var arrayPromise = WinJS.Promise.wrap(myArray);
        arrayPromise.then(function completed(mixes) {
            renderDefaultMixes(mixes);
        }, function errored(response) { });
    }
    function renderDefaultMixes(mixes) {
        //tagMixesWithMixSet(mixes, "dj");
        addMixesToAllMixes(mixes);
        linkMixes(mixes);
        app.sessionState.defaultMixSet = mixes;
        var listView = document.querySelector("#allMixesListView").winControl;
        for (var i = 0; i < mixes.length; i++) {
            globalMixList.push(mixes[i]);
        }
        var myGroupedList = globalMixList.createGrouped(getGroupKey, getGroupData, compareMixSetNames);
        listView.itemDataSource = myGroupedList.dataSource;
        listView.groupDataSource = myGroupedList.groups.dataSource;
    }

    function getRecommendedMixes() {
        console.log("getting recommended mixes");
        Networker.getRecommendedMixes(app.sessionState.userId, "5", "1").then(
            function completed(mixes) {
                processMixSet(mixes,"recommended");
            },
            function errored(response) {
            },
            function progress() {
            });
    }

    function getMixFeedMixes() {
        console.log("getting mix feed");
        Networker.getMixFeed(app.sessionState.userId, "5", "1").then(
            function completed(mixes) {
                processMixSet(mixes,"mixFeed");
            },
            function errored(response) {
            },
            function progress() {
            });
    }


    function getListeningHistoryMixes() {
        console.log("getting listening history");
        Networker.getListeningHistory(app.sessionState.userId, "5", "1").then(
            function completed(mixes) {
                processMixSet(mixes, "listeningHistory");
            },
            function errored(response) {
            },
            function progress() {
            });
    }

    function getLatestMixes(eventargs) {
        console.log("getting latest mixes....");
        Networker.getLatestMixes("5", "1").then(
            function completed(mixes) {
                processMixSet(mixes,"latest");
            }, function errored(response) {
            });
    }
  

    function getFavoriteMixes(eventargs) {
        console.log("getting favorite mixes....");
        Networker.getFavoriteMixes(app.sessionState.userId, "5", "1").then(function completed(mixes) {
            processMixSet(mixes,"favorite");
        }, function errored(response) { });
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

    function addLoadCompleteEventListenersToListViews() {
        var listViews = document.querySelectorAll(".win-listview");
        for (var i = 0; i < listViews.length; i++) {
            var listView = listViews[i];
            listView.addEventListener("loadingstatechanged", mixesLoaded);
        }
    }

    function processMixSet(mixes,mixSetName) {
        tagMixesWithMixSet(mixes, mixSetName);
        addMixesToAllMixes(mixes);
        linkMixes(mixes);
        app.sessionState.mixSets[mixSetName] = mixes;
        replacePlaceholderMixes(mixSetName, mixes);
    }

    function replacePlaceholderMixes(mixSetName, actualMixes) {
        //setAt allows me to set items that exist at certain indicies.
        //So, I'll grab all the indices that have a certain mixSetName and in id of -1,
        //log those indices, and then set as many of those indices as I can
        //with mixes. If I don't have enough indices, I'll just add the mixes 
        //to the end
        var indices = new Array();
        for (var i = 0; i < globalMixList.length; i++) {
            if (globalMixList.getAt(i).mixSetName === mixSetName && globalMixList.getAt(i).id === "-1") {
                console.log("finding indices");
                indices.push(i);
            }
        }
        if (indices.length < actualMixes.length) {
            for (var i = indices.length; i < actualMixes.length; i++) {
                console.log("more mixes than indicies");
                globalMixList.push(actualMixes[i]);
            }
            for (var i = 0; i < indices.length; i++) {
                console.log("case 0, adding mixes");
                globalMixList.setAt(indices[i], actualMixes[i]);
            }
        } else if (indices.length >= actualMixes.length) {
            for (var i = 0; i < actualMixes.length; i++) {
                console.log("case 1, adding mixes");
                globalMixList.setAt(indices[i], actualMixes[i]);
            }
        }
        //for (var i = 0; i < actualMixes.length; i++) {
        //    globalMixList.setAt(i,actualMixes[i]);
        //}
    }

    function loadCustomMixes(eventargs) {
        console.log("properties have changed");
    }


    WinJS.UI.Pages.define("/browse/browse.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            document.querySelector("#reRenderMixSets").addEventListener("click", reRenderMixSets);
            document.querySelector("#loggedInContainer").addEventListener("propertychange", loadCustomMixes);
            getLatestMixes();
            if (app.sessionState.loggedIn) {
                getFavoriteMixes();
                getListeningHistoryMixes();
                getMixFeedMixes();
                getRecommendedMixes();
            }
            addLoadCompleteEventListenersToListViews();
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
