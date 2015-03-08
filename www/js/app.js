var app = angular.module('ionicApp', [
    'ngRoute',
    'ngCookies',
    'ionic',
    "ngSanitize",
    "com.2fdevs.videogular",
    "com.2fdevs.videogular.plugins.controls"
    ]);

app.filter('trusted', ['$sce', function ($sce) {
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };
}]);

app.run(function($rootScope, $ionicPopup, $state, $stateParams, $ionicHistory, $ionicSlideBoxDelegate, $location, $cookies) {
    $rootScope.clearSession = function() {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Logging Out',
            template: 'Are you sure you want to logout? This will clear your current session',
            cssClass: 'Modal_Buttons'
        });
        confirmPopup.then(function(res) {
            if(res) {
                sessionStorage.clear();
                delete $cookies.username;
                console.log($cookies.username);
                $state.go('SignIn');
            }
        });
    };

    $rootScope.home = function(){
        $state.go("Menu");
    }

    $rootScope.back = function(){
        var confirmPopup = $ionicPopup.confirm({
            title: 'Leaving this Task',
            template: 'Are you sure you want to leave this task?'
        });
        confirmPopup.then(function(res) {
            if(res) {
                $state.go('Tasks');
            }
        });
    };

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams){
        var authNeeded = toState.data.requiresAuth;
        var paramNeeded = toState.data.requiresParam;
        var user = $cookies.username;

        if(authNeeded && !toState.data.isLogin && typeof user === 'undefined'){
            event.preventDefault();
            $state.go('SignIn');
        }

        if(paramNeeded){
            if(toParams.allow !== 'true' || sessionStorage.getItem("taskName") === null){
                event.preventDefault();
                $state.go('Tasks');
            }
        }



        $ionicHistory.clearCache();
    });

    $rootScope.disableSwipe = function() {
        $ionicSlideBoxDelegate.enableSlide(false);
    };

    $rootScope.commands = {
        'home': function() {
            $rootScope.home();
        },
        'back': function() {
            $rootScope.back();
        },
        'logout': function(){
            $rootScope.clearSession();
        },
        'ok': function(){
            var ok = document.getElementsByClassName("popup-buttons");
            ok[0].lastElementChild.click();
        },
        'cancel': function(){
            var ok = document.getElementsByClassName("popup-buttons");
            ok[0].firstElementChild.click();
        }
    }
    if(annyang){
        annyang.start();
        annyang.addCommands($rootScope.commands);
    }

});