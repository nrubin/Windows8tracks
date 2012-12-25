// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    function renderMixList(mixes) {
        var listView = document.querySelector("#basicListView").winControl;
        var dataList = new WinJS.Binding.List(mixes);
        listView.itemDataSource = dataList.dataSource;
    }

    WinJS.UI.Pages.define("/home.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            Networker.login("windows8tracks", "password");
            //Networker.reportSong("1234", "1110", "4546");
            //var playToken = Networker.playToken;
            Networker.getFavoriteMixes();
            var mixes = null;
            Networker.getLatestMixes("5", "1", renderMixList)
            //console.log(mixes);
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
