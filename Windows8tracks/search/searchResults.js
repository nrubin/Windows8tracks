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
        ready: function (element, options) {
            var pageControl = element;
            var listView = pageControl.querySelector("#searchResults").winControl;
            listView.itemTemplate = pageControl.querySelector(".itemtemplate");
            //listView.oniteminvoked = this._itemInvoked;
            this.handleQuery(pageControl, options);
            //listView.element.focus();
        },

        // This function executes each step required to perform a search.
        handleQuery: function (pageControl, args) {
            var originalResults;
            this.lastSearch = args.queryText;
            //this.initializeLayout(element.querySelector(".resultslist").winControl, Windows.UI.ViewManagement.ApplicationView.value);
            this.searchData(pageControl, args.queryText);
            originalResults = this.searchData(pageControl, args.queryText); // this is the sync search call
            //if (originalResults.length === 0) {
            //    document.querySelector('.filterarea').style.display = "none";
            //} else {
            //    document.querySelector('.resultsmessage').style.display = "none";
            //}
            //this.populateFilterBar(element, originalResults);
            //this._applyFilter(this._filters[0], originalResults);
        },


        searchEventHandler: function (queryText) {
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
                    url : "http://8tracks.com/mixes.json" + urlPrefix + "include=mixes&tags="+ escapedQueryText + "&per_page=" + perPage + "&page=" + pageNumber
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
        },

        searchData: function (element,queryText) {
            var originalResults;
            var sr = this;
            sr.searchEventHandler(queryText).done(
            function (mixes) {
                //completed
                originalResults = mixes;
                sr.formatResults(element,mixes);
            },
            function (response) {
                //errored
            },
            function () {
                //in progress
            });
            //if (window.Data) {
            //    originalResults = Data.items.createFiltered(function (item) {
            //        return (item.name.indexOf(queryText) >= 0 || item.user.login.indexOf(queryText) >= 0 || item.description.indexOf(queryText) >= 0);
            //    });
            //} else {
            //    originalResults = new WinJS.Binding.List();
            //}
            //return originalResults;
        },

        formatResults: function (pageControl, mixes) {
            var mixesList = new WinJS.Binding.List(mixes);
            var listView = pageControl.querySelector("#searchResults").winControl;
            listView.itemDataSource = mixesList.dataSource;
        }
    });


    // This function updates the ListView with new layouts
    //initializeLayout: function (listView, viewState) {
    //    /// <param name="listView" value="WinJS.UI.ListView.prototype" />
    //    if (viewState === appViewState.snapped) {
    //        listView.layout = new ui.ListLayout();
    //        document.querySelector(".titlearea .pagetitle").textContent = '“' + this._lastSearch + '”';
    //        document.querySelector(".titlearea .pagesubtitle").textContent = "";
    //    } else {
    //        listView.layout = new ui.GridLayout();
    //        document.querySelector(".titlearea .pagetitle").textContent = "Windows8tracks";
    //        document.querySelector(".titlearea .pagesubtitle").textContent = "Results for “" + this._lastSearch + '”';
    //    }
    //},

    // This function updates the page layout in response to viewState changes.
    //updateLayout: function (element, viewState, lastViewState) {
    //    /// <param name="element" domElement="true" />
    //    var listView = element.querySelector(".resultslist").winControl;
    //    if (lastViewState !== viewState) {
    //        if (lastViewState === appViewState.snapped || viewState === appViewState.snapped) {
    //            var handler = function (e) {
    //                listView.removeEventListener("contentanimating", handler, false);
    //                e.preventDefault();
    //            }
    //            listView.addEventListener("contentanimating", handler, false);
    //            var firstVisible = listView.indexOfFirstVisible;
    //            this._initializeLayout(listView, viewState);
    //            if (firstVisible >= 0 && listView.itemDataSource.list.length > 0) {
    //                listView.indexOfFirstVisible = firstVisible;
    //            }
    //        }
    //    }
    //},
})();