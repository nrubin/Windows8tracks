// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";
    var app = WinJS.Application;
    var nav = WinJS.Navigation;

    function login() {
        var username = document.querySelector("#username").value;
        var password = document.querySelector("#password").value;
        Networker.login(username, password, loginCallback);
        Networker.getPlayToken(function (token) { app.sessionState.playToken = token });
    };

    function loginCallback(loginSuccessful,userToken, userId) {
        if (loginSuccessful) {
            app.sessionState.userToken = userToken;
            app.sessionState.userId = userId;
            console.log(userToken);
            nav.navigate("/browse/browse.html");
        } else {
            document.querySelector("#loginError").setAttribute("style", "display: inline");
        }
    };

    WinJS.UI.Pages.define("/home/home.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            document.querySelector("#login").addEventListener("click", login);
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
