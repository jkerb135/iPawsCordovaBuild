/**
 * Created by Josh on 2/23/2015.
 */


app.config(function($routeProvider, $stateProvider, $urlRouterProvider, $ionicConfigProvider, $locationProvider){
        $stateProvider
            .state('Default', {
                url: '/',
                templateUrl: 'views/sign-in.html',
                controller: "SignInCtrl",
                data: {
                    requiresAuth: false,
                    requiresParam: false,
                    isLogin: true
                }
            })
            .state('SignIn',{
                url: '/SignIn',
                templateUrl : 'views/sign-in.html',
                controller: 'SignInCtrl',
                data: {
                    requiresAuth: false,
                    requiresParam: false,
                    isLogin: true
                }
            })
            .state('Menu', {
                url: '/Menu',
                templateUrl: 'views/menu.html',
                controller: 'HomeTabCtrl',
                data: {
                    requiresAuth: true,
                    requiresParam: false,
                    isLogin: false
                }
            })
            .state('Tasks', {
                url: '/Tasks',
                templateUrl: 'views/tasks.html',
                controller: 'CompleteTabCtrl',
                data: {
                    requiresAuth: true,
                    requiresParam: false,
                    isLogin: false
                }
            })
            .state('Start', {
                url: '/Start/{allow}',
                templateUrl: 'views/start_task.html',
                controller: 'DoTaskCtrl',
                data: {
                    requiresAuth: true,
                    requiresParam: true,
                    isLogin: false
                }
            })
            .state('Run',{
                url: '/Run/{allow}',
                abstract: true,
                templateUrl: 'views/run_template.html',
                data: {
                    requiresAuth: true,
                    requiresParam: true,
                    isLogin: false
                }
            })
            .state('Run.Start', {
                url: '/Start',
                views: {
                    'home': {
                        templateUrl: 'views/run_task.html',
                        controller: 'RunTaskCtrl'
                    }
                }
            })
            .state('Run.Done', {
                url: '/Done',
                views: {
                    'home': {
                        templateUrl: 'views/finish_task.html',
                        controller: 'FinishTaskCtrl'
                    }
                }
            })
            .state('Results', {
                url: '/Results/{allow}',
                templateUrl: 'views/results.html',
                controller: 'ResultsCtrl',
                data: {
                    requiresAuth: true,
                    requiresParam: true,
                    isLogin: false
                }
            })
    $urlRouterProvider.otherwise('/SignIn');

    $locationProvider.html5Mode(true);
});