// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";
    var app = WinJS.Application;
    var nav = WinJS.Navigation;
    var player = null;

    function beginListening(eventargs) {
        //eventargs.srcElement.removeEventListener("click");
        var playToken = app.sessionState.playToken;
        var mix = app.sessionState.currentMix;
        Networker.beginMix(playToken, mix.id, loadSet);
        console.log("poop");
    }

    function loadSet(set) {
        /*
        Once a set is received, this method binds the set metadata to the audio player
        and the windows media controls
        */
        var player = document.querySelector("#player"); //namespace issues w/ callbacks
        var song = set.track;
        player.src = song.track_file_stream_url; //immediately start buffering track
        player.load();
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