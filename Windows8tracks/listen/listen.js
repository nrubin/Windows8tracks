// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";
    var app = WinJS.Application;
    var nav = WinJS.Navigation;

    function beginListening(eventargs) {
        //eventargs.srcElement.removeEventListener("click");
        var playToken = app.sessionState.playToken;
        var mix = app.sessionState.currentMix;
        var player = document.querySelector("audio");
        Networker.playSong(playToken, mix.id, function (set) { player.src = set.track.track_file_stream_url; });
    }

    function setup() {
        var playToken = app.sessionState.playToken;
        var mix = app.sessionState.currentMix;
        document.querySelector(".pagesubtitle").innerText = mix.name;
        document.querySelector(".mix-pic").src = mix.cover_urls.sq100;
        document.querySelector(".mix-description").innerText = mix.description;
        document.querySelector(".mix-pic").addEventListener("click", beginListening);
    }

    WinJS.UI.Pages.define("/listen/listen.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            setup();
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
