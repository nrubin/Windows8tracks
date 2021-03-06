﻿// For an introduction to the Search Contract template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232512
// TODO: Add the following script tag to the start page's head to
// subscribe to search contract events.
//  
// <script src="/search/searchResults.js"></script>
//
// TODO: Edit the manifest to enable use as a search target.  The package 
// manifest could not be automatically updated.  Open the package manifest file
// and ensure that support for activation of searching is enabled.
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var appModel = Windows.ApplicationModel;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var app = WinJS.Application;
    var nav = WinJS.Navigation;
    var ui = WinJS.UI;
    var searchPageURI = "/search/searchResults.html";
    var searchedMixes = {};
    var verticalMixNumber = 3;
    var horizontalMixNumber = 2;
    var totalMixNumber = verticalMixNumber * horizontalMixNumber;


    ui.Pages.define(searchPageURI, {
        lastSearch: "",

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, queryText) {
            totalMixNumber = utils.processWindowHeight(200,500);
            var pageControl = element;
            WinJS.UI.processAll().then(function () {
                var listView = document.querySelector("#searchResultsListView").winControl;
                listView.itemTemplate = document.querySelector("#mixTemplate");
                document.querySelector('.resultsmessage').style.display = "none";
                //listView.oniteminvoked = this.itemInvoked;
                handleQuery(pageControl, queryText);
                listView.element.focus();
                addLoadCompleteEventListenersToListViews();
            })

        }
    });

    function userHasScrolled(eventargs) {
        console.log("the user has scrolled this much: " + eventargs.wheelDelta.toString());
    }

    // This function executes each step required to perform a search.
    function handleQuery(pageControl, args) {
        var originalResults;
        app.sessionState.lastSearch = args.queryText;
        //this.initializeLayout(element.querySelector(".resultslist").winControl, Windows.UI.ViewManagement.ApplicationView.value);
        searchData(pageControl, args.queryText);
    };

    function searchData(element, queryText) {
        var originalResults;
        var header = document.querySelector("#searchResultsHeader");
        header.innerText = "Search results for \"" + queryText + "\""
        var resultsMessage = document.querySelector('.resultsmessage');
        Networker.getMixesBySearchTerm(queryText, totalMixNumber * 2, 1).done(
        function completed(mixes) {
            originalResults = mixes;
            formatResults(element, mixes);
        },
        function errored(response) {
            resultsMessage.innerHTML = "The search failed. Check your internet connection and try again.";
            resultsMessage.class += " error";
            resultsMessage.style.display = "inline";
        },
        function inprogress() {
            //in progress
        });
    };

    function formatResults(pageControl, mixes) {
        if (mixes.length > 0) {
            document.querySelector('.resultsmessage').style.display = "none";
        }
        utils.linkMixes(mixes);
        tagMixesWithMixSet(mixes, "searched");
        utils.addMixesToAllMixes(mixes, searchedMixes);
        var mixesList = new WinJS.Binding.List(mixes);
        var listView = document.querySelector("#searchResultsListView").winControl;
        listView.itemDataSource = mixesList.dataSource;
        addLoadCompleteEventListenersToListViews();
    }


    function initializeLayout(listView, viewState) {
        if (viewState === appViewState.snapped) {
            listView.layout = new ui.ListLayout();
            document.querySelector(".titlearea .pagetitle").textContent = '“' + this._lastSearch + '”';
            document.querySelector(".titlearea .pagesubtitle").textContent = "";
        } else {
            listView.layout = new ui.ListLayout();
            document.querySelector(".titlearea .pagetitle").textContent = "Windows8tracks";
            document.querySelector(".titlearea .pagesubtitle").textContent = "Results for “" + this._lastSearch + '”';
        }
    }

    function tagMixesWithMixSet(mixes, mixSetName) {
        //tags a mix with the mix set it belongs to (e.g. "latest" or "favorite")
        for (var i = 0; i < mixes.length; i++) {
            var mix = mixes[i];
            mix.progressBarDisplay = "none";
            mix.mixTitleDisplay = "inline";
            mix.mixSetName = mixSetName;
            mix.escapedCoverUrls = {}
            for (var imgName in mix.cover_urls) {
                mix.escapedCoverUrls[imgName] = "url('" + mix.cover_urls[imgName] + "')";//enabled cover urls in css
            }
        }
    }

    function addEventListenerstoMix(eventargs) {
        var listViewDOM = eventargs.srcElement;
        var listViewWinControl = listViewDOM.winControl;
        if (listViewWinControl.loadingState === "complete") {
            listViewDOM.addEventListener("mousewheel", userHasScrolled);
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
            listView.addEventListener("loadingstatechanged", addEventListenerstoMix);
        }
    }

    function playSelectedMix(eventargs) {
        var mixId = eventargs.srcElement.parentNode.parentNode.querySelector(".mix-id").innerText;
        var selectedMix = searchedMixes[mixId];
        app.sessionState.currentMix = selectedMix;
        nav.navigate("/listen/listen.html");
    }

    // This function updates the page layout in response to viewState changes.
    function updateLayout(element, viewState, lastViewState) {
        /// <param name="element" domElement="true" />
        var listView = element.querySelector(".resultslist").winControl;
        if (lastViewState !== viewState) {
            if (lastViewState === appViewState.snapped || viewState === appViewState.snapped) {
                var handler = function (e) {
                    listView.removeEventListener("contentanimating", handler, false);
                    e.preventDefault();
                }
                listView.addEventListener("contentanimating", handler, false);
                var firstVisible = listView.indexOfFirstVisible;
                this._initializeLayout(listView, viewState);
                if (firstVisible >= 0 && listView.itemDataSource.list.length > 0) {
                    listView.indexOfFirstVisible = firstVisible;
                }
            }
        }
    }
})();