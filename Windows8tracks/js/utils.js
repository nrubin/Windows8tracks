(function () {
    "use strict";
    var app = WinJS.Application;

    WinJS.Namespace.define("utils");

    utils.loadSet = function (set) {
        /*
        Loads a set into the audio player and sets all the proper formatting and local app stuff
        */
        var mediaControl = Windows.Media.MediaControl;
        var app = WinJS.Application;
        var mix = app.sessionState.currentMix;
        var song = set.track;
        var player = document.querySelector("#player");
        var appBarAlbumArt = document.querySelector("#appBarAlbumArt");
        //immediately start buffering
        player.src = song.track_file_stream_url;
        player.load();
        //render all the UI
        appBarAlbumArt.src = app.sessionState.currentMix.cover_urls.sq100;
        appBarAlbumArt.style.display = "inline";
        mediaControl.artistName = song.performer;
        mediaControl.trackName = song.name;
        document.querySelector("#appBarSongTitle").innerText = song.name;
        document.querySelector("#appBarSongArtist").innerText = song.performer;
        try {
            document.querySelector(".pagesubtitle").innerText = mix.name;
            document.querySelector(".mix-pic").src = mix.cover_urls.sq100;
            document.querySelector(".mix-description").innerText = mix.description;
        } catch (e) {
        }
        app.sessionState.currentSet = set;
        app.sessionState.currentSetReported = false;
        player.play();
        document.querySelector("#appBarPlayPause").winControl.icon = 'pause';
        document.querySelector("#appBarPlayPause").winControl.label = 'Pause';
        document.querySelector("#mainAppBar").winControl.show();
    };

    utils.addMixesToAllMixes = function (mixesToAdd,mixTracker){
        for (var i = 0; i < mixesToAdd.length; i++) {
            var mix = mixesToAdd[i];
            mixTracker[mix.id] = mix;
        }
    };

    utils.linkMixes = function (mixes) {
        for (var i = 0; i < mixes.length - 1; i++) {
            var mix = mixes[i];
            mix.nextMix = mixes[i + 1];
        }
    }
    utils.editCoverUrls = function (mix) {
        mix.escapedCoverUrls = {}
        for (var url in mix.cover_urls) {
            mix.escapedCoverUrls[url] = "url('" + mix.cover_urls[imgName] + "')";
        }
    }

    utils.tagMixesWithMixSet = function(mixes,mixSetName){
        for (var i = 0; i < mixes.length; i++) {
            mix.progressBarDisplay = "none";
            mix.mixTitleDisplay = "inline";
            mix.mixSetName = mixSetName;
            utils.editCoverUrls(mix);
        }
    }

    utils.processWindowHeight = function (heightSize,widthSize) {
        var verticalMixNumber = Math.floor(app.sessionState.screenSize.height / heightSize);
        var horizontalMixNumber = Math.floor(app.sessionState.screenSize.width / widthSize);
        var totalMixNumber = verticalMixNumber * horizontalMixNumber;
        console.log("I want this many mixes:");
        console.log(totalMixNumber);
        return totalMixNumber;
    }

    utils.getRandomNumberFromRange = function (min, max) {
        return Math.random() * (max - min) + min;
    }




})();