// For an introduction to the Search Contract template, see the following documentation:
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
    var utils = WinJS.Utilities;
    var searchPageURI = "/search/searchResults.html";
    var searchedMixes = {};


    WinJS.Application.addEventListener("activated", function (args) {
        if (args.detail.kind === appModel.Activation.ActivationKind.search) {
            args.setPromise(ui.processAll().then(function () {
                if (!nav.location) {
                    nav.history.current = {
                        location: Application.navigator.home,
                        initialState: {}
                    };
                }
                return nav.navigate(searchPageURI, {
                    queryText: args.detail.queryText
                });
            }));
        }
    });

    appModel.Search.SearchPane.getForCurrentView().onquerysubmitted = function (args) {
        nav.navigate(searchPageURI, args);
    };

    ui.Pages.define(searchPageURI, {
        lastSearch: "",

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, queryText) {
            var pageControl = element;
            var listView = pageControl.querySelector("#searchResults").winControl;
            listView.itemTemplate = pageControl.querySelector(".itemtemplate");
            document.querySelector('.resultsmessage').style.display = "none";
            //listView.oniteminvoked = this.itemInvoked;
            handleQuery(pageControl, queryText);
            listView.element.focus();
            addLoadCompleteEventListenersToListViews();
        }
    });

    // This function executes each step required to perform a search.
    function handleQuery(pageControl, args) {
        var originalResults;
        app.sessionState.lastSearch = args.queryText;
        //this.initializeLayout(element.querySelector(".resultslist").winControl, Windows.UI.ViewManagement.ApplicationView.value);
        searchData(pageControl, args.queryText);
    };


    function searchEventHandler(queryText) {
        var searchList = new WinJS.Binding.List();
        return new WinJS.Promise(function (completed, errored, progress) {
            var userId = app.sessionState.userId;
            var urlPrefix = "?api_version=2.1&format=jsonh&"
            var escapedQueryText = encodeURIComponent(queryText);
            var perPage = 10;
            var pageNumber = 1;
            var options = {
                headers: {
                    "X-Api-Key": "a355db8b5d8c4c15b7a719484b1fd6cbec1c2067",
                    "If-Modified-Since": "Mon, 27 Mar 1972 00:00:00 GMT"
                },
                type: "GET",
                url: "http://8tracks.com/mixes.json" + urlPrefix + "include=mixes&tags=" + escapedQueryText + "&per_page=" + perPage + "&page=" + pageNumber
            }
            WinJS.xhr(options).done(
            function onCompleted(response) {
                var responseObj = JSON.parse(response.responseText);
                if (responseObj.status === "200 OK") {
                    console.log("received searched mixes");
                    console.log(response.responseText);
                    var mixes = responseObj.mix_set.mixes;
                    completed(mixes);
                } else {
                    console.log("did not receive searched mixes");
                    console.log(response.responseText);
                    errored(response);
                }
            }, function onError(response) {
                console.log("did not receive searched mixes");
                console.log(response.responseText);
                errored(response);
            }, function inProgress(response) {
                console.log("receiving searched mixes...");
                progress();
            });
        });
    };

    function searchData(element, queryText) {
        var originalResults;
        var resultsMessage = document.querySelector('.resultsmessage');
        searchEventHandler(queryText).done(
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
        linkMixes(mixes);
        tagMixesWithMixSet(mixes, "searched");
        addMixesToAllMixes(mixes);
        var mixesList = new WinJS.Binding.List(mixes);
        var listView = pageControl.querySelector("#searchResults").winControl;
        listView.itemDataSource = mixesList.dataSource;
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

    function addMixToAllMixes(mix) {
        var id = mix.id;
        searchedMixes[id] = mix;
    }

    function addMixesToAllMixes(mixes) {
        for (var i = 0; i < mixes.length; i++) {
            var mix = mixes[i];
            addMixToAllMixes(mix);
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

    function tagMixesWithMixSet(mixes, mixSetName) {
        //tags a mix with the mix set it belongs to (e.g. "latest" or "favorite")
        for (var i = 0; i < mixes.length; i++) {
            var mix = mixes[i];
            mix.mixSetName = mixSetName;
        }
    }

    function addEventListenerstoMix(eventargs) {
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