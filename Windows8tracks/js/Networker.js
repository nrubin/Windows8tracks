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
    var headers = {
        "X-Api-Key": APIKey,
        "If-Modified-Since": "Mon, 27 Mar 1972 00:00:00 GMT"
    };
    var urlPrefix = "?api_version=2.1&format=jsonh&"
    var userToken = ""
    var playToken = ""
    var userObj = null;
    var defaultOptions = {
        type: "GET",
        headers: headers,
    }

    var AmazonSecretKey = "Hze+DufofO8Bky0wNdtErkmPLk4qa6sIDlOSS3kw"
    var AmazonAccessKey = "AKIAIALLLG2CUNSPGLYQ"
    Networker.login = function (username, password) {
        /* 
        logs a given unane/pw combo into 8tracks. Sets the user token and play tokens
        callback receives a boolean if the user is or is not loggen in
        */
        defaultOptions.url = "https://8tracks.com/sessions/create_get" + urlPrefix + "&login=" + username + "&password=" + password;
        return new WinJS.Promise(function (completed, errored, progress) {
            WinJS.xhr(defaultOptions).done(
           function onCompleted(response) {
               responseObj = JSON.parse(response.responseText);
               if (responseObj.status === "200 OK") {
                   console.log(response);
                   completed(responseObj.user);
               } else {
                   console.log("login unsuccessful");
                   console.log(response.responseText);
                   errored(response)
               }
           },

           function onError(response) {
               console.log("login not successful");
               console.log(response.responseText);
               errored(response)
           },

           function inProgress(response) {
               console.log("logging " + username + " into 8tracks");
               progress();
           });
        });
    };

    Networker.logout = function () {
        var newOptions = {}
        newOptions.url = "http://8tracks.com/logout";
        newOptions.type = "POST";
        newOptions.headers = headers;
        return new WinJS.Promise(function (completed, errored, progress) {
            WinJS.xhr(newOptions).then(
                function onComplete(response) {
                    completed(response);
                },
            function onError(response) {
                errored(response);
            },
            function onProgress() {
            });
        });
    }

    Networker.getPlayToken = function () {
        /*
        retrieves the play token for the session
        callback receives the play token, or "-1" if the request fails
        */
        defaultOptions.url = "http://8tracks.com/sets/new.json" + urlPrefix
        return new WinJS.Promise(function (completed, errored, progress) {
            WinJS.xhr(defaultOptions).done(
           function onCompleted(response) {
               console.log("received play token");
               console.log(response.responseText);
               try {
                   var responseObj = JSON.parse(response.responseText);
                   playToken = responseObj.play_token;
                   completed(playToken);
               } catch (e) {
                   console.log("did not receive play token");
                   console.log(response.responseText);
                   playToken = "-1"
                   errored(playToken);
               }
           },

           function onError(response) {
               console.log("did not receive play token");
               console.log(response.responseText);
               errored(response);
           },

           function inProgress(response) {
               console.log("retrieving play token...");
               progress();
           });
        });

    };

    Networker.getLatestMixes = function (perPage, pageNumber) {
        /*
        fetches the latest mixes from 8tracks, returns a promise
        */
        defaultOptions.url = "http://8tracks.com/mixes.json?per_page=" + perPage + "&page=" + pageNumber;
        return new WinJS.Promise(function (completed, errored, progress) {
            WinJS.xhr(defaultOptions).then(
            function onCompleted(response) {
                var responseObj = JSON.parse(response.responseText);
                if (responseObj.status === "200 OK") {
                    console.log("received latest mixes");
                    console.log(response.responseText);
                    var mixes = responseObj.mixes;
                    completed(mixes);
                } else {
                    console.log("did not receive latest mixes");
                    console.log(response.responseText);
                    errored(response);
                }
            },
            function onError(response) {
                console.log("did not receive latest mixes");
                console.log(response.responseText);
                errored(response);
            },
            function inProgress() {
                progress();
            });
        });
    };

    Networker.getFavoriteMixes = function (userId, perPage, pageNumber) {
        /*
        fetches the logged in user's mixes from 8tracks, then calls callback on the list of mixes
        if the fetch fails, callback receives null
        */
        defaultOptions.url = "http://8tracks.com/users/" + userId + "/mixes.json" + urlPrefix + "view=liked&per_page=" + perPage + "&page=" + pageNumber;
        return new WinJS.Promise(function (completed, errored, progress) {
            WinJS.xhr(defaultOptions).then(
            function onCompleted(response) {
                var responseObj = JSON.parse(response.responseText);
                if (responseObj.status === "200 OK") {
                    console.log("received favorite mixes");
                    console.log(response.responseText);
                    var mixes = responseObj.mix_set.mixes;
                    completed(mixes);
                } else {
                    console.log("did not receive favorite mixes");
                    console.log(response.responseText);
                    errored(response);
                }
            },
            function onError(response) {
                console.log("did not receive favorite mixes");
                console.log(response.responseText);
                errored(response);
            },
            function inProgress() {
                progress();
            });
        });
    };

    Networker.getListeningHistory = function (userId, perPage, pageNumber) {
        //RETURNS A PROMISE
        defaultOptions.url = "http://8tracks.com/mix_sets/listened:" + userId + ".json" + urlPrefix + "include=mixes&per_page=" + perPage + "&page=" + pageNumber;
        return new WinJS.Promise(function (completed, errored, progress) {
            WinJS.xhr(defaultOptions).then(
            function onCompleted(response) {
                var responseObj = JSON.parse(response.responseText);
                if (responseObj.status === "200 OK") {
                    console.log("received listening history mixes");
                    console.log(response.responseText);
                    var mixes = responseObj.mix_set.mixes;
                    completed(mixes);
                } else {
                    console.log("did not receive listening history mixes");
                    console.log(response.responseText);
                    errored(response);
                }
            },
            function onError(response) {
                console.log("did not receive listening history mixes");
                console.log(response.responseText);
                errored(response);
            },
            function inProgress() {
                progress();
            });
        });
    };

    Networker.getMixFeed = function (userId, perPage, pageNumber) {
        //RETURNS A PROMISE
        defaultOptions.url = "http://8tracks.com/mix_sets/feed:" + userId + ".json" + urlPrefix + "include=mixes&per_page=" + perPage + "&page=" + pageNumber;
        return new WinJS.Promise(function (completed, errored, progress) {
            WinJS.xhr(defaultOptions).then(
            function onCompleted(response) {
                var responseObj = JSON.parse(response.responseText);
                if (responseObj.status === "200 OK") {
                    console.log("received mix feed mixes");
                    console.log(response.responseText);
                    var mixes = responseObj.mix_set.mixes;
                    completed(mixes);
                } else {
                    console.log("did not receive mix feed mixes");
                    console.log(response.responseText);
                    errored(response);
                }
            },
            function onError(response) {
                console.log("did not receive mix feed mixes");
                console.log(response.responseText);
                errored(response);
            },
            function inProgress() {
                progress();
            });
        });

    };

    Networker.getRecommendedMixes = function (userId, perPage, pageNumber) {
        //RETURNS A PROMISE
        defaultOptions.url = "http://8tracks.com/mix_sets/recommended:" + userId + ".json" + urlPrefix + "include=mixes&per_page=" + perPage + "&page=" + pageNumber;
        return new WinJS.Promise(function (completed, errored, progress) {
            WinJS.xhr(defaultOptions).then(
            function onCompleted(response) {
                var responseObj = JSON.parse(response.responseText);
                if (responseObj.status === "200 OK") {
                    console.log("received recommended mixes");
                    console.log(response.responseText);
                    var mixes = responseObj.mix_set.mixes;
                    completed(mixes);
                } else {
                    console.log("did not receive recommended mixes");
                    console.log(response.responseText);
                    errored(response);
                }
            },
            function onError(response) {
                console.log("did not receive recommended mixes");
                console.log(response.responseText);
                errored(response);
            },
            function inProgress() {
                progress();
            });
        });
    };

    Networker.getMixDJ = function (userId, perPage, pageNumber) {
        //RETURNS A PROMISE
        defaultOptions.url = "http://8tracks.com/mix_sets/dj:" + userId + ".json" + urlPrefix + "include=mixes&per_page=" + perPage + "&page=" + pageNumber;
        return new WinJS.Promise(function (completed, errored, progress) {
            WinJS.xhr(defaultOptions).then(
            function onCompleted(response) {
                var responseObj = JSON.parse(response.responseText);
                if (responseObj.status === "200 OK") {
                    console.log("received dj mixes");
                    console.log(response.responseText);
                    var mixes = responseObj.mix_set.mixes;
                    completed(mixes);
                } else {
                    console.log("did not receive dj mixes");
                    console.log(response.responseText);
                    errored(response);
                }
            },
            function onError(response) {
                console.log("did not receive dj mixes");
                console.log(response.responseText);
                errored(response);
            },
            function inProgress() {
                progress();
            });
        });
    };

    Networker.getMixesByTag = function (queryText, perPage, pageNumber) {
        /*
        receives query text from the search charm and searches for mixes according to those tags
      */
        var escapedQueryText = encodeURIComponent(queryText);
        defaultOptions.url = "http://8tracks.com/mixes.json" + urlPrefix + "include=mixes&tags=" + escapedQueryText + "&per_page=" + perPage + "&page=" + pageNumber;
        return new WinJS.Promise(function (completed, errored, progress) {
            WinJS.xhr(defaultOptions).then(
            function onCompleted(response) {
                var responseObj = JSON.parse(response.responseText);
                if (responseObj.status === "200 OK") {
                    console.log("received tagged mixes");
                    console.log(response.responseText);
                    var mixes = responseObj.mix_set.mixes;
                    completed(mixes);
                } else {
                    console.log("did not receive tagged mixes");
                    console.log(response.responseText);
                    errored(response);
                }
            },
            function onError(response) {
                console.log("did not receive tagged mixes");
                console.log(response.responseText);
                errored(response);
            },
            function inProgress() {
                progress();
            });
        });
    };

    Networker.getMixesBySearchTerm = function (queryText, perPage, pageNumber) {
        /*
        receives query text from the search charm and searches for mixes according to those tags
      */
        var escapedQueryText = encodeURIComponent(queryText);
        defaultOptions.url = "http://8tracks.com/mixes.json" + urlPrefix + "include=mixes&q=" + escapedQueryText + "&per_page=" + perPage + "&page=" + pageNumber;
        return new WinJS.Promise(function (completed, errored, progress) {
            WinJS.xhr(defaultOptions).then(
            function onCompleted(response) {
                var responseObj = JSON.parse(response.responseText);
                if (responseObj.status === "200 OK") {
                    console.log("received searched mixes");
                    console.log(response.responseText);
                    var mixes = responseObj.mix_set.mixes;
                    completed(mixes);
                } else {
                    console.log("did not receive searched mixes");
                    console.log(response.responseText);
                    errored(response);
                }
            },
            function onError(response) {
                console.log("did not receive searched mixes");
                console.log(response.responseText);
                errored(response);
            },
            function inProgress() {
                progress();
            });
        });
    };

    Networker.beginMix = function (playToken, mixId, callback) {
        /*
        Begins playback of a mix. callback receives a "set", which contains some information
        about the position of the track within a mix (presumably the beginning).
        */
        defaultOptions.url = "http://8tracks.com/sets/" + playToken + "/play" + urlPrefix + "&mix_id=" + mixId;
        return new WinJS.Promise(function (completed, errored, progress) {
            WinJS.xhr(defaultOptions).done(
            function onCompleted(response) {
                var responseObj = JSON.parse(response.responseText);
                if (responseObj.status === "200 OK") {
                    console.log("received set");
                    console.log(response.responseText);
                    completed(responseObj.set);
                }
                else {
                    console.log("did not receive set");
                    console.log(response.responseText);
                    errored(response);
                }
            },

            function onError(response) {
                console.log("did not receive set");
                console.log(response.responseText);
                errored(response);
            },

            function inProgress(response) {
                console.log("receiving set...");
                progress();
            });
        });
    };

    Networker.nextSong = function (playToken, mixId, callback) {
        /*
        Gets the next song in a mix. callback function receives the response, and is responsible for handling the end of a mix
        */
        defaultOptions.url = "http://8tracks.com/sets/" + playToken + "/next" + urlPrefix + "mix_id=" + mixId;
        WinJS.xhr(defaultOptions).done(
        function onCompleted(response) {
            var responseObj = JSON.parse(response.responseText);
            if (responseObj.status === "200 OK") {
                console.log("received next");
                console.log(response.responseText);
                callback(responseObj);
            }
            else {
                console.log("did not receive next song");
                console.log(response.responseText);
            }
        },

        function onError(response) {
            console.log("did not receive next song");
            console.log(response.responseText);
        },

        function inProgress(response) {
            console.log("receiving next song...");
        });

    };

    Networker.skipSong = function (playToken, mixId, callback) {
        /*
        skips a song in the mix. callback function receives the response object, and is responsible for handling a limited number of mixes and the end of a mix
        */
        defaultOptions.url = "http://8tracks.com/sets/" + playToken + "/skip" + urlPrefix + "mix_id=" + mixId;
        WinJS.xhr(defaultOptions).done(
        function onCompleted(response) {
            var responseObj = JSON.parse(response.responseText);
            if (responseObj.status === "200 OK") {
                console.log("received skip");
                console.log(response.responseText);
                callback(responseObj);
            }
            else {
                console.log("did not receive skip song");
                console.log(response.responseText);
            }
        },

        function onError(response) {
            console.log("did not receive skip song");
            console.log(response.responseText);
        },

        function inProgress(response) {
            console.log("receiving skip song...");
        });
    };

    Networker.reportSong = function (playToken, trackId, mixId) {
        defaultOptions.url = "http://8tracks.com/sets/" + playToken + "/report" + urlPrefix + "track_id=" + trackId + "&mixId=" + mixId;
        WinJS.xhr(defaultOptions).done(

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
        });
    };

    Networker.getAlbumArt = function (artistName, album) {
        //http://webservices.amazon.com/onca/xml?
        //    Service=AWSECommerceService&
        //    AWSAccessKeyId=[AWS Access Key ID]&
        //    Operation=ItemSearch&
        //    Keywords=Rocket&
        //    SearchIndex=Toys
        //    &Timestamp=[YYYY-MM-DDThh:mm:ssZ]
        //&Signature=[Request Signature]
        var keywords = artistName + "+" + album;
        var encodedKeywords = encodeURI(keywords);
        var urlToSign = "GET\nhttp://webservices.amazon.com\n/onca/xml\nAWSAccessKeyId=" + AmazonAccessKey+"&Keywords=" + encodedKeywords+"&Operation=ItemSearch&SearchIndex=Music&Service=AWSECommerceService";
        var signedUrl = AWSQS.signQuery(urlToSign, AmazonSecretKey);
        var options = {
            url: signedUrl,
            data: {}
        };
        return new WinJS.Promise(function (completed, errored, progress) {
            WinJS.xhr(options).then(
                function onComplete(response) {
                    completed(response);
            }, function onError(response) {
                errored(response);
            }, function onProgress() {
                progress();
            });
        });
            
    }


}());