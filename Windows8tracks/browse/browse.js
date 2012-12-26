// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";
    var app = WinJS.Application;
    var nav = WinJS.Navigation;
    var allMixes = {};

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

    function getLatestMixes(eventargs) {
        console.log("getting latest mixes....");
        Networker.getLatestMixes("5", "1", renderLatestMixList);
    }
    function renderLatestMixList(mixes) {
        addMixesToAllMixes(mixes);
        var listView = document.querySelector("#latestMixesListView").winControl;
        var dataList = new WinJS.Binding.List(mixes);
        listView.itemDataSource = dataList.dataSource;
    }

    function getFavoriteMixes(eventargs) {
        console.log("getting favorite mixes....");
        Networker.getFavoriteMixes(app.sessionState.userId,"5","1",renderFavoriteMixList);
    }
    function renderFavoriteMixList(mixes) {
        addMixesToAllMixes(mixes);
        console.log("rendering favorite mixes");
        var listView = document.querySelector("#favoriteMixesListView").winControl;
        var dataList = new WinJS.Binding.List(mixes);
        listView.itemDataSource = dataList.dataSource;
    }

    function playMix(eventargs) {
        var mixId = eventargs.srcElement.parentNode.parentNode.querySelector(".mix-id").innerText;
        app.sessionState.currentMix = allMixes[mixId];
        nav.navigate("/listen/listen.html");
    }

    function addEventListenerstoMix(eventargs) {
        var listViewDOM = eventargs.srcElement;
        var listViewWinControl = listViewDOM.winControl;
        if (listViewWinControl.loadingState === "complete") {
            var mixes = listViewDOM.querySelectorAll(".mix");
            for (var i = 0; i < mixes.length; i++) {
                var mix = mixes[i];
                mix.addEventListener("click", playMix);
            }
        }
    }

    function addLoadCompleteEventListenersToListViews( )
    {
        var listViews = document.querySelectorAll(".win-listview");
        for (var i = 0; i < listViews.length; i++) {
            var listView = listViews[i];
            listView.addEventListener("loadingstatechanged", addEventListenerstoMix);
        }
    }


    WinJS.UI.Pages.define("/browse/browse.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            document.querySelector("#getLatestMixes").addEventListener("click", getLatestMixes);
            document.querySelector("#getFavoriteMixes").addEventListener("click", getFavoriteMixes);
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
