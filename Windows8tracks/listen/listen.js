// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";
    var app = WinJS.Application;
    var nav = WinJS.Navigation;
    var player;

    function beginListening(eventargs) {
        console.log("beginning to listen");
        var playToken = app.sessionState.playToken;
        var mix = app.sessionState.currentMix;
        Networker.beginMix(playToken, mix.id).then(
            function completed(set) {
                utils.loadSet(set);
            },
            function errored(response) {

            },
            function progress(response) {

            });
    }



    WinJS.UI.Pages.define("/listen/listen.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            if (!app.sessionState.playToken) {
                Networker.getPlayToken().then(function completed(playToken) { app.sessionState.playToken = playToken}, function errored(response) { }, function progress() { });
            }
            player = document.querySelector("#player");
            var playToken = app.sessionState.playToken;
            var mix = app.sessionState.currentMix;
            document.querySelector(".pagesubtitle").innerText = mix.name;
            document.querySelector(".mix-pic").src = mix.cover_urls.max200;
            document.querySelector(".mix-description").innerText = mix.description;
            document.querySelector(".mix-pic").addEventListener("click", beginListening);
            

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