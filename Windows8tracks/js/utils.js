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

    utils.getRandomNumberFromRange = function (min, max) {
        return Math.random() * (max - min) + min;
    }






})();