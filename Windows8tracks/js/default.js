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
        var totalTime = player.duration;
        var currentTime = player.currentTime;
        var fraction = currentTime / totalTime;
        document.getElementById("songProgressBar").value = fraction * 100;
        if (player.currentTime >= 30 && player.currentTime <= 31 && !app.sessionState.currentSetReported) {
            app.sessionState.currentSetReported = true;
            var mix = app.sessionState.currentMix;
            var set = app.sessionState.currentSet;
            var playToken = app.sessionState.playToken;
            Networker.reportSong(playToken, set.track.id, mix.id);
        }
    }




    function launchLogout() {
        Networker.logout().then(
            function completed(response) {
                console.log("logout successful");
                console.log(response);
            }, function errored(response) {
                console.log("logout unsuccessful");
                console.log(response);
            });
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
        credentialOptions.message = "You'll be able to view your favorite mixes, and much more";
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
                    document.querySelector("#userAvatar").style.backgroundImage = "url('" + user.avatar_urls.sq100 + "')";
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
                    Networker.beginMix(playToken, mixId).then.then(
            function completed(set) {
                utils.loadSet(set);
            },
            function errored(response) {

            },
            function progress(response) {

            });
                } else {
                    console.log("the mix set is over");
                }
            }
        } else {
            console.log("there is no mix or play token currently set");
        }
    }

    function nextMix() {
        app.sessionState.goToNextMix = false;
        var nextMix = app.sessionState.currentMix.nextMix;
        if (nextMix) {
            app.sessionState.currentMix = nextMix; //set the current mix
            var mixId = app.sessionState.currentMix.id;
            Networker.beginMix(app.sessionState.playToken, mixId, playNewMix);
        } else {
            console.log("the mix set is over");
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
        mediaControl.artistName = song.performer;
        mediaControl.trackName = song.name;
        player.src = song.track_file_stream_url; //immediately start buffering track
        player.load();
        player.play();
        document.querySelector("#mainAppBar").winControl.show();
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
    }

    function pause() {
        player.pause();
    }
    function playpause() {
        if (!player.paused) {
            player.pause();
            document.querySelector("#appBarPlayPause").winControl.icon = 'play';
            document.querySelector("#appBarPlayPause").winControl.label = 'Play';
            Windows.Media.MediaControl.isPlaying = false;
        } else {
            player.play();
            document.querySelector("#appBarPlayPause").winControl.icon = 'pause';
            document.querySelector("#appBarPlayPause").winControl.label = 'Pause';
            Windows.Media.MediaControl.isPlaying = true;
        }
    }
    function play() {
        player.play();
        document.querySelector("#appBarPlayPause").winControl.icon = 'pause';
        document.querySelector("#appBarPlayPause").winControl.label = 'Pause';
        Windows.Media.MediaControl.isPlaying = true;
    }
    function pause() {
        player.pause();
        document.querySelector("#appBarPlayPause").winControl.icon = 'play';
        document.querySelector("#appBarPlayPause").winControl.label = 'Play';
        Windows.Media.MediaControl.isPlaying = false;
    }
    function stop() {
    }

    function setupMediaControls() {
        var mediaControl = Windows.Media.MediaControl;
        mediaControl.addEventListener("playpausetogglepressed", playpause, false);
        mediaControl.addEventListener("playpressed", play, false);
        mediaControl.addEventListener("stoppressed", stop, false);
        mediaControl.addEventListener("pausepressed", pause, false);
        mediaControl.addEventListener("nexttrackpressed", skipSong, false);
        document.getElementById("appBarPlayPause").addEventListener("click", playpause);
        document.getElementById("appBarSkipSong").addEventListener("click", skipSong);
        document.getElementById("appBarNextMix").addEventListener("click", nextMix);

        //mediaControl.albumArt = Windows.Foundation.Uri("ms-appx:///media/images/sampleAlbumArt.jpg");
    };

    function setupAppBar() {
        var appBar = document.querySelector("#mainAppBar").winControl;
        var appBarPlayPause = document.querySelector("#appBarPlayPause").winControl;
        var progressBar = document.querySelector("#songProgressBar");
        //appBarPlayPause.icon = 'play';
    }


    app.onactivated = function (args) {
        app.sessionState.screenSize = {
            width: window.innerWidth,
            height: window.innerHeight
        }
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
                //appBar.show();
                //document.querySelector("#appBarPlayPause").winControl.icon = 'play';
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }

            if (app.sessionState.history) {
                nav.history = app.sessionState.history;
            }
            args.setPromise(WinJS.UI.processAll().then(function () {
                setupAppBar();
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
