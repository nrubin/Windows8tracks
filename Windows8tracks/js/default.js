// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;
    var player = null;

    function reportSong(eventargs) {
        if (player.currentTime >= 30 && player.currentTime <= 31 && !app.sessionState.currentSetReported) {
            app.sessionState.currentSetReported = true;
            var mix = app.sessionState.currentMix;
            var set = app.sessionState.currentSet;
            var playToken = app.sessionState.playToken;
            Networker.reportSong(playToken, set.track.id, mix.id);
        }
    }

    function playNewMix(set) {
        /*
        Once a set is received, this method binds the set metadata to the audio player
        and the windows media controls
        */
        var mediaControl = Windows.Media.MediaControl;
        var mix = app.sessionState.currentMix
        document.querySelector(".pagesubtitle").innerText = mix.name;
        document.querySelector(".mix-pic").src = mix.cover_urls.sq100;
        document.querySelector(".mix-description").innerText = mix.description;
        var player = document.querySelector("#player"); //namespace issues w/ callbacks
        app.sessionState.currentSet = set;
        app.sessionState.currentSetReported = false;
        var song = set.track;
        mediaControl.artistName = song.performer;
        mediaControl.trackName = song.name;
        player.src = song.track_file_stream_url; //immediately start buffering track
        player.load();
    }


    function launchLogout() {
        app.sessionState.previouslyLoggedIn = app.sessionState.currentlyLoggedIn;
        app.sessionState.currentlyLoggedIn = false;
        document.querySelector("#loginContainer").style.display = "inline";
        document.querySelector("#loggedInContainer").style.display = "none";
    }

    function launchLogin() {
        var credentialOptions = Windows.Security.Credentials.UI.CredentialPickerOptions();
        credentialOptions.authenticationProtocol = Windows.Security.Credentials.UI.AuthenticationProtocol.basic;
        credentialOptions.credentialSaveOption = Windows.Security.Credentials.UI.CredentialSaveOption.hidden;
        credentialOptions.callerSavesCredential = true;
        credentialOptions.caption = "Log in to 8tracks";
        credentialOptions.message = "You must be logged in to listen to a mix";
        credentialOptions.targetName = ".";
        Windows.Security.Credentials.UI.CredentialPicker.pickAsync(credentialOptions).then(function (results) {
            var username = results.credentialUserName;
            var password = results.credentialPassword;
            Networker.login(username, password).then(
                function completed(user) {
                    app.sessionState.userToken = user.user_token;
                    app.sessionState.userId = user.id;
                    app.sessionState.currentUser = user;
                    app.sessionState.previouslyLoggedIn = app.sessionState.currentlyLoggedIn;
                    app.sessionState.currentlyLoggedIn = true;
                    document.querySelector("#userAvatar").src = user.avatar_urls.sq100;
                    document.querySelector("#username").innerText = user.login;
                    document.querySelector("#loginContainer").style.display = "none";
                    document.querySelector("#loggedInContainer").style.display = "inline";
                    Networker.getPlayToken().then(function completed(playToken) { app.sessionState.playToken = playToken }, function errored(response) { });
                    //reloadCurrentPage();
                },
                function errored(response) {
                    console.log("login failed");
                },
                function progress() {
                });
        });
    };

    function nextSong() {
        //this gets called at the end of a song, not when a skip occurs
        //it needs to handle the end of a mix, so it unpacks the next mix ffom the current one and handles things nicely.
        if (app.sessionState.currentMix && app.sessionState.playToken) {
            var playToken = app.sessionState.playToken;
            if (!app.sessionState.goToNextMix) {
                var mixId = app.sessionState.currentMix.id;
                var playToken = app.sessionState.playToken;
                Networker.nextSong(playToken, mixId, loadNextSong);
            } else {
                //pull the next mix from the current mix
                var nextMix = app.sessionState.currentMix.nextMix;
                if (nextMix) {
                    app.sessionState.currentMix = nextMix; //set the current mix
                    var mixId = app.sessionState.currentMix.id;
                    Networker.beginMix(playToken, mixId, playNewMix);
                } else {
                    console.log("the mix set is over");
                }
            }
        } else {
            console.log("there is no mix or play token currently set");
        }
    }

    function loadNextSong(responseObj) {
        var mediaControl = Windows.Media.MediaControl;
        var set = responseObj.set;
        app.sessionState.currentSet = set;
        app.sessionState.currentSetReported = false;
        //need to set up pulling of next mix if at last song of current mix
        if (set.at_last_track) {
            app.sessionState.goToNextMix = true;
        }
        var player = document.querySelector("#player"); //namespace issues w/ callbacks
        var song = set.track;
        //mediaControl.albumArt = Networker.getAlbumArt(songTitle,artist,etc...).then.... TODO
        mediaControl.artistName = song.performer;
        mediaControl.trackName = song.name;
        player.src = song.track_file_stream_url; //immediately start buffering track
        player.load();
        player.play();
    }

    function skipSong() {
        //this gets called when a song is skipped, not when a song ends
        if (app.sessionState.currentMix && app.sessionState.playToken) {
            var mixId = app.sessionState.currentMix.id;
            var playToken = app.sessionState.playToken;
            Networker.skipSong(playToken, mixId, loadSkipSong);
        } else {
            console.log("there is no mix currently set");
        }
    }

    function loadSkipSong(responseObj) {
        if (responseObj.status === "200 OK") {
            loadNextSong(responseObj);
        } else {
            console.log("no more skips!!");
        }
        //var player = document.querySelector("#player"); //namespace issues w/ callbacks
        //var song = set.track;
        //player.src = song.track_file_stream_url; //immediately start buffering track
        //player.load();
    }

    // Define functions that will be the event handlers
    function pause() {
        player.pause();
    }
    function playpause() {
        if (!player.paused) {
            player.pause();
            Windows.Media.MediaControl.isPlaying = false;
        } else {
            player.play();
            Windows.Media.MediaControl.isPlaying = true;
        }
    }
    function play() {
        // Handle the Play event and print status to screen..
        player.play();
        Windows.Media.MediaControl.isPlaying = true;
    }
    function pause() {
        // Handle the Pause event and print status to screen.
        player.pause();
        Windows.Media.MediaControl.isPlaying = false;
    }
    function stop() {
        console.log("fuck off");
    }

    function setupMediaControls() {
        var mediaControl = Windows.Media.MediaControl;
        mediaControl.addEventListener("playpausetogglepressed", playpause, false);
        mediaControl.addEventListener("playpressed", play, false);
        mediaControl.addEventListener("stoppressed", stop, false);
        mediaControl.addEventListener("pausepressed", pause, false);
        //mediaControl.albumArt = Windows.Foundation.Uri("ms-appx:///media/images/sampleAlbumArt.jpg");
    }


    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
                player = document.querySelector("audio");
                player.setAttribute("msAudioCategory", "BackgroundCapableMedia");
                player.addEventListener("timeupdate", reportSong);
                player.addEventListener("ended", nextSong);
                setupMediaControls();
                
                document.querySelector("#nextSong").addEventListener("click", nextSong);
                document.querySelector("#skipSong").addEventListener("click", skipSong);
                document.querySelector("#launchLogin").addEventListener("click", launchLogin);
                document.querySelector("#launchLogout").addEventListener("click", launchLogout);
                app.sessionState.mixSets = {};
                app.sessionState.currentlyLoggedIn = false;
                app.sessionState.previouslyLoggedIn = false;
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }

            if (app.sessionState.history) {
                nav.history = app.sessionState.history;
            }
            args.setPromise(WinJS.UI.processAll().then(function () {
                if (nav.location) {
                    nav.history.current.initialPlaceholder = true;
                    return nav.navigate(nav.location, nav.state);
                } else {
                    return nav.navigate(Application.navigator.home);
                }
            }));
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };

    app.start();

})();
