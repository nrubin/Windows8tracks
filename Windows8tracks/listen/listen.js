// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";
    var app = WinJS.Application;
    var nav = WinJS.Navigation;
    var player = null;

    function beginListening(eventargs) {
        //eventargs.srcElement.removeEventListener("click");
        console.log("beginning to listen");
        var playToken = app.sessionState.playToken;
        var mix = app.sessionState.currentMix;
        Networker.beginMix(playToken, mix.id, loadSet);
    }

    function loadSet(set) {
        /*
        Once a set is received, this method binds the set metadata to the audio player
        and the windows media controls
        */
        var player = document.querySelector("#player"); //namespace issues w/ callbacks
        app.sessionState.currentSet = set;
        app.sessionState.currentSetReported = false;
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
            if (!app.sessionState.playToken) {
                Networker.getPlayToken().then(function completed(playToken) { app.sessionState.playToken = playToken}, function errored(response) { }, function progress() { });
            }
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

    //if (!app.sessionState.playToken) {
    //    var credentialOptions = Windows.Security.Credentials.UI.CredentialPickerOptions();
    //    credentialOptions.authenticationProtocol = Windows.Security.Credentials.UI.AuthenticationProtocol.basic;
    //    credentialOptions.credentialSaveOption = Windows.Security.Credentials.UI.CredentialSaveOption.hidden;
    //    credentialOptions.callerSavesCredential = true;
    //    credentialOptions.caption = "Please log in to 8tracks";
    //    credentialOptions.message = "You must be logged in to listen to a mix";
    //    credentialOptions.targetName = ".";
    //    Windows.Security.Credentials.UI.CredentialPicker.pickAsync(credentialOptions).then(function (results) {
    //        console.log("the credential results are");
    //        console.log(results);
    //        var username = results.credentialUserName;
    //        var password = results.credentialPassword;
    //        Networker.login(username, password, function (loginSuccessful, userToken, userId) {
    //            if (loginSuccessful) {
    //                app.sessionState.userToken = userToken;
    //                app.sessionState.userId = userId;
    //                Networker.getPlayToken(function (token) { app.sessionState.playToken = token });
    //            } else {
    //                // login failed
    //            }
    //        });
    //    });
    //}
})();