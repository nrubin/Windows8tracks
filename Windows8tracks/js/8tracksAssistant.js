(function () {
    /*
   This module wil handle all the network calls in the app, including:
   Login, user token retrieval, play token retrieval
   Accessing, browsing and searching for mixes
   song playing, seeking, skipping and reporting
   and other misc actions defined in the API
   */
    WinJS.Namespace.define("Networker");
    var APIKey = "a355db8b5d8c4c15b7a719484b1fd6cbec1c2067";
    var headers = { "X-Api-Key": APIKey };
    var urlPrefix = "?api_version=2.1&format=jsonh&"
    var userToken = ""
    var playToken = ""
    var userObj = null;
    var defaultOptions = {
        type: "GET",
        headers: headers,
    }
    Networker.login = function (username, password) {
        /* 
        logs a given unane/pw combo into 8tracks. Sets the user token and play tokens
        */
        defaultOptions.url = "https://8tracks.com/sessions/create_get" + urlPrefix + "&login=" + username + "&password=" + password
        WinJS.xhr(defaultOptions).then(
            function onCompleted(response) {
                console.log("login successful");
                console.log(response.responseText);
                userObj = JSON.parse(response.responseText);
                userToken = userObj.user_token;
                Networker.getPlayToken();
            },
            function onError(response) {
                console.log("login not successful");
                console.log(response.responseText);
            },
            function inProgress(response) {
                console.log("logging " + username + " into 8tracks");
            }
            );
    }

    Networker.getPlayToken = function () {
        defaultOptions.url = "http://8tracks.com/sets/new.json" + urlPrefix
        WinJS.xhr(defaultOptions).then(
           function onCompleted(response) {
               console.log("received play token");
               console.log(response.responseText);
               var responseObj = JSON.parse(response.responseText);
               playToken = responseObj.play_token;
           },
            function onError(response) {
                console.log("did not receive play token");
                console.log(response.responseText);
                playToken = "-1"
            },
            function inProgress(response) {
                console.log("retrieving play token...");
            }
          );
    }

    Networker.getMix = function (playToken, mixId) {
        defaultOptions.url = "http://8tracks.com/sets/" + playToken + "/play" + urlPrefix + "&mix_id=" + mixId;
        WinJS.xhr(defaultOptions).then(
        function onCompleted(response) {
            console.log("received mix");
            console.log(response.responseText);
        },
        function onError(response) {
            console.log("did not receive mix");
            console.log(response.responseText);
        },
        function inProgress(response) {
            console.log("receiving mix...");
        });
    }

    Networker.reportSong = function (playToken, trackId, mixId) {
        defaultOptions.url = "http://8tracks.com/sets/" + playToken + "/report" + urlPrefix + "track_id=" + trackId + "&mixId=" + mixId;
        WinJS.xhr(defaultOptions).then(
       function onCompleted(response) {
           console.log("reported song");
           console.log(response.responseText);
       },
        function onError(response) {
            console.log("did not report song");
            console.log(response.responseText);
        },
        function inProgress(response) {
            console.log("reporting song...");
        }
      );
    }

}());