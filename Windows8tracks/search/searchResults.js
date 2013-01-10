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
  
    ui.Pages.define(searchPageURI, {
        _filters: [],
        _lastSearch: "",

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var listView = element.querySelector(".resultslist").winControl;
            listView.itemTemplate = element.querySelector(".itemtemplate");
            listView.oniteminvoked = this._itemInvoked;
            this._handleQuery(element, options);
            listView.element.focus();
        },

        // This function updates the page layout in response to viewState changes.
        updateLayout: function (element, viewState, lastViewState) {
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
        },

        // This function filters the search data using the specified filter.
        _applyFilter: function (filter, originalResults) {
            if (filter.results === null) {
                filter.results = originalResults.createFiltered(filter.predicate);
            }
            return filter.results;
        },

        // This function responds to a user selecting a new filter. It updates the
        // selection list and the displayed results.
        _filterChanged: function (element, filterIndex) {
            var filterBar = element.querySelector(".filterbar");
            var listView = element.querySelector(".resultslist").winControl;

            utils.removeClass(filterBar.querySelector(".highlight"), "highlight");
            utils.addClass(filterBar.childNodes[filterIndex], "highlight");

            element.querySelector(".filterselect").selectedIndex = filterIndex;

            listView.itemDataSource = this._filters[filterIndex].results.dataSource;
        },

        generateFilters: function () {
            this._filters = [];
            this._filters.push({
                results: null,
                text: "All",
                predicate: function (item) {
                    return true;
                }
            });

            // TODO: Replace or remove example filters.
            //this._filters.push({
            //    results: null,
            //    text: "",
            //    predicate: function (item) {
            //        return item.group.key === "group1";
            //    }
            //});
            //this._filters.push({
            //    results: null,
            //    text: "",
            //    predicate: function (item) {
            //        return item.group.key !== "group1";
            //    }
            //});
        },


        // This function executes each step required to perform a search.
        _handleQuery: function (element, args) {
            var originalResults;
            this._lastSearch = args.queryText;
            WinJS.Namespace.define("searchResults", {
                markText: WinJS.Binding.converter(this._markText.bind(this))
            });
            this._initializeLayout(element.querySelector(".resultslist").winControl, Windows.UI.ViewManagement.ApplicationView.value);
            this.generateFilters();
            this._searchData(args.queryText);
            originalResults = this._searchData(element, args.queryText); // this is the sync search call
            //if (originalResults.length === 0) {
            //    document.querySelector('.filterarea').style.display = "none";
            //} else {
            //    document.querySelector('.resultsmessage').style.display = "none";
            //}
            //this.populateFilterBar(element, originalResults);
            //this._applyFilter(this._filters[0], originalResults);
        },
        formatResults : function(element, results){
            if (results.length === 0) {
                document.querySelector('.filterarea').style.display = "none";
            } else {
                document.querySelector('.resultsmessage').style.display = "none";
            }
            this.populateFilterBar(element, results);
            this._applyFilter(this._filters[0], results);
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
                        for (var i = 0; i < mixes.length; i++) {
                            var mix = mixes[i];
                            searchList.push(mix);
                        }
                        completed(searchList);
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

        // This function updates the ListView with new layouts
        _initializeLayout: function (listView, viewState) {
            /// <param name="listView" value="WinJS.UI.ListView.prototype" />
            if (viewState === appViewState.snapped) {
                listView.layout = new ui.ListLayout();
                document.querySelector(".titlearea .pagetitle").textContent = '“' + this._lastSearch + '”';
                document.querySelector(".titlearea .pagesubtitle").textContent = "";
            } else {
                listView.layout = new ui.GridLayout();

                document.querySelector(".titlearea .pagetitle").textContent = "Windows8tracks";
                document.querySelector(".titlearea .pagesubtitle").textContent = "Results for “" + this._lastSearch + '”';
            }
        },

        _itemInvoked: function (args) {
            args.detail.itemPromise.done(function itemInvoked(item) {
                // TODO: Navigate to the item that was invoked.
                var selectedItem = item;
                console.log(selectedItem);
            });
        },

        // This function colors the search term. Referenced in /search/searchResults.html
        // as part of the ListView item templates.
        _markText: function (text) {
            return text.replace(this._lastSearch, "<mark>" + this._lastSearch + "</mark>");
        },

        // This function generates the filter selection list.
        populateFilterBar: function (element, originalResults) {
            var filterBar = element.querySelector(".filterbar");
            var listView = element.querySelector(".resultslist").winControl;
            var li, option, filterIndex;

            filterBar.innerHTML = "";
            for (filterIndex = 0; filterIndex < this._filters.length; filterIndex++) {
                this._applyFilter(this._filters[filterIndex], originalResults);

                li = document.createElement("li");
                li.filterIndex = filterIndex;
                li.tabIndex = 0;
                li.textContent = this._filters[filterIndex].text + " (" + this._filters[filterIndex].results.length + ")";
                li.onclick = function (args) {
                    this._filterChanged(element, args.target.filterIndex);
                }.bind(this);
                li.onkeyup = function (args) {
                    if (args.key === "Enter" || args.key === "Spacebar") this._filterChanged(element, args.target.filterIndex);
                }.bind(this);
                utils.addClass(li, "win-type-interactive");
                utils.addClass(li, "win-type-x-large");
                filterBar.appendChild(li);

                if (filterIndex === 0) {
                    utils.addClass(li, "highlight");
                    listView.itemDataSource = this._filters[filterIndex].results.dataSource;
                }

                option = document.createElement("option");
                option.value = filterIndex;
                option.textContent = this._filters[filterIndex].text + " (" + this._filters[filterIndex].results.length + ")";
                element.querySelector(".filterselect").appendChild(option);
            }

            element.querySelector(".filterselect").onchange = function (args) {
                this._filterChanged(element, args.currentTarget.value);
            }.bind(this);
        },

        // This function populates a WinJS.Binding.List with search results for the
        // provided query.
        _searchData: function (element,queryText) {
            var originalResults;
            var sr = this;
            // TODO: Perform the appropriate search on your data.
            sr.searchEventHandler(queryText).done(function (mixes) {
                originalResults = mixes;
                sr.formatResults(element,mixes);
                //sr.generateFilters(originalResults);
                //sr.populateFilterBar(originalResults);
            },
            function (response) {

            },
            function () {

            });
            //if (window.Data) {
            //    originalResults = Data.items.createFiltered(function (item) {
            //        return (item.name.indexOf(queryText) >= 0 || item.user.login.indexOf(queryText) >= 0 || item.description.indexOf(queryText) >= 0);
            //    });
            //} else {
            //    originalResults = new WinJS.Binding.List();
            //}
            //return originalResults;
        }
    });

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
})();