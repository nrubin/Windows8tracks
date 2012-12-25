// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    function getLatestMixes(eventargs) {
        console.log("getting latest mixes....");
        Networker.getLatestMixes("5", "1", renderMixList);
    }
    function renderMixList(mixes) {
        var listView = document.querySelector("#basicListView").winControl;
        var dataList = new WinJS.Binding.List(mixes);
        listView.itemDataSource = dataList.dataSource;
    }

    WinJS.UI.Pages.define("/browse/browse.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            document.querySelector("#getLatestMixes").addEventListener("click", getLatestMixes);
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
