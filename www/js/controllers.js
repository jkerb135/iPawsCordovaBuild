/**
 * Created by Josh on 2/23/2015.
 */
var api = "http://ipawsteamb.csweb.kutztown.edu/"
//var api = "http://ipaws.ngrok.com/";
//var api = "http://localhost:6288/";


app.controller('SignInCtrl', function($scope, $http, $ionicPopup, $timeout, Auth, Api, Data, $cookies, $location) {

    if(typeof $cookies.username !== 'undefined'){
        $location.path('/Menu');
    }

    $scope.login = function(user){
        sessionStorage.clear();

        if(user === undefined || user === null){
            user = {
                username: "Tina Pelle",
                password: "ku123."
            }
        }

        Auth.login({
            action: 'login',
            username: user.username,
            password: user.password
        });

        Data.storeCurrentUser(user.username);

        Api.getUserData(user.username, function(categories){
            Data.storeCategories(categories);
        });
    }
});

app.controller('HomeTabCtrl', function($scope, $location) {
    $scope.complete = function(){
        $location.path('/Tasks');
    }
});

app.controller('CompleteTabCtrl', function($scope, $ionicPopup, $timeout, $state, $http, Api, Data, $cookies) {
    $scope.categories = JSON.parse(sessionStorage.getItem("categories"));
    $scope.username = $cookies.username;
    var user = $cookies.username;

    Api.getCompletedTasks(user, function(data){
        angular.forEach($scope.categories , function(cat){
           angular.forEach(cat.tasks, function(task){
              angular.forEach(data, function(comp){
                  if(task.taskId == comp.taskID){
                      angular.element(document.querySelector('#task_' + task.taskId)).removeClass('invisible');
                      task.completed = true;
                      task.dateComplete = moment(comp.dateTimeCompleted).format("M/DD/YYYY");
                      var time = moment.duration((comp.totalTime), 'milliseconds');
                      task.timeComplete = moment(time.asMilliseconds()).format('mm:ss');
                      task.stepsUsed = comp.totalDetailedStepsUsed;
                  };

              });
           });
        });
        Data.storeCompltedTasks(data);
        $scope.completed = data;
    });

    $scope.doRefresh = function() {
        $http.get(api + '/api/user/GetByUser/' + user)
            .success(function(categories){
                Api.getCompletedTasks(user, function(data){
                    angular.forEach($scope.categories , function(cat){
                        angular.forEach(cat.tasks, function(task){
                            angular.forEach(data, function(comp){
                                if(task.taskId == comp.taskID){
                                    angular.element(document.querySelector('#task_' + task.taskId)).removeClass('invisible');
                                    task.completed = true;
                                    task.dateComplete = moment(comp.dateTimeCompleted).format("M/DD/YYYY");
                                    var time = moment.duration((comp.totalTime), 'milliseconds');
                                    task.timeComplete = moment(time.asMilliseconds()).format('mm:ss');
                                    task.stepsUsed = comp.totalDetailedStepsUsed;
                                };

                            });
                        });
                    });
                    Data.storeCompltedTasks(data);
                    $scope.completed = data;
                });
                Data.storeCategories(categories);
                $scope.categories = categories;
            })
            .finally(function() {
                $scope.$broadcast('scroll.refreshComplete');
            });
    };

    $scope.getTaskData = function(catId, task) {
        Api.getTaskData(task.taskId, function (mainsteps) {
            if (mainsteps.length == 0) {
                var popup = $ionicPopup.show({
                    title: 'No Steps have been entered for this task'
                });

                $timeout(function () {
                    popup.close(); //close the popup after 3 seconds for some reason
                }, 1500);
            }
            else {
                Data.storeTask(task);
                Data.storeCategoryId(catId);
                Data.storeMainSteps(mainsteps);
                Data.storeTaskId(task.taskId);
                Data.storeTaskName(task.taskName);

                if(!task.completed) {
                    var requirements = [];
                    angular.forEach(mainsteps, function (step) {
                        if (step.mainStepText !== null) {
                            requirements.push({text: step.mainStepText, checked: false});
                        }
                    });

                    if (requirements.length === 0) {
                        requirements.push("No Requirements Entered");
                    }

                    Data.storeRequiredItems(requirements);
                    $state.go('Start',{allow: true});
                }
                else{
                    $state.go('Results',{allow: true});
                }
            }
        });

    }

    $scope.activeTabs = [];

    $scope.toggleTab = function(tab){
        if($scope.isOpen(tab)){
            $scope.activeTabs.splice($scope.activeTabs.indexOf(tab),1);
        }
        else{
            $scope.activeTabs.push(tab);
        }
    };

    $scope.isOpen = function(tab){
        if($scope.activeTabs.indexOf(tab) > -1){
            return true;
        } else{
            return false;
        }
    };
});

app.controller('DoTaskCtrl', function(Data, $scope, Api, $state, $rootScope, $cookies) {
    var mainSteps = JSON.parse(sessionStorage.getItem("mainSteps"));
    var requirements = JSON.parse(sessionStorage.getItem("requiredItems"));
    var flag = false;
    var slideIndex = 0;
    var user = $cookies.username;

    $scope.taskName = sessionStorage.getItem("taskName");

    // Showing Necessary Items needed to continue with the task.
    $scope.ableToStartTask = function(){
        if(!flag) {
            var filter = $scope.requriedItems.filter(filterChecked);
            if (filter.length == $scope.requriedItems.length) {
                angular.element(document.querySelector('#startTask')).removeClass('disabled');
            }
            else {
                angular.element(document.querySelector('#startTask')).addClass('disabled');
            }
        }
    };



    $scope.requriedItems = requirements

    if(requirements.length === 0){
        angular.element(document.querySelector('#startTask')).removeClass('disabled');
    }

    //Showing current progress of the task
    var progression = [];
    Api.getCompletedSteps(user,sessionStorage.getItem("taskId"),function(completed){
        for(var i = 0, len = mainSteps.length; i < len; i++){
            var current = mainSteps[i];
            for(var j = 0, len2 = completed.length; j < len2; j++){
                var current2 = completed[j];
                if(current.mainStepID === current2.mainStepId){
                    current.checked = true;
                    angular.element(document.querySelector('#startTask')).removeClass('disabled');
                    angular.element(document.querySelector('#startTask')).text("Continue");
                    slideIndex++;
                    flag = true;
                    break;
                }
                else{
                    current.checked = false;
                }
            };
            progression.push({text: current.mainStepName, checked: current.checked})
        };
        $scope.progression = progression;
    });

    $scope.start = function(){
        $rootScope.slideIndex = slideIndex;
        $state.go('Run.Start',{allow: true});
    };

    if(annyang) {
        var commands = $rootScope.commands;
        commands.start = function () {
            $scope.start();
        }
        annyang.removeCommands();
        annyang.addCommands(commands);
    }
});

app.controller('ResultsCtrl',function($scope, $state, $rootScope, $cookies){
    var data = JSON.parse(sessionStorage.getItem("task"));
    var user = $cookies.username;
    $scope.name = user;
    $scope.taskName = data.taskName;
    $scope.steps = data.stepsUsed;
    $scope.time = data.timeComplete;
    $scope.date = data.dateComplete;

    $scope.done = function(){
        $state.go('Tasks');
    };

    $scope.startOver = function(){
        $rootScope.slideIndex = 0;
        $state.go('Run.Start',{allow: true});
    };

    if(annyang) {
        annyang.removeCommands();
        var commands = $rootScope.commands;
        commands.redo = function () {
            $scope.startOver();
        }
        commands.done = function () {
            $scope.done();
        }
        annyang.addCommands(commands);
    }
});

app.controller('RunTaskCtrl', function($scope, $rootScope, $interval, $ionicSlideBoxDelegate, $state, Data, Api, $ionicPopup, $cookies, $sce){
    var totalElapsedMs = 0;
    var elapsedMs = 0;
    var startTime;
    var timerPromise;
    var stepsUsed = 0;
    var wasShown = false;
    var user = $cookies.username;

    $scope.taskName = sessionStorage.getItem("taskName");
    $rootScope.requriedItems = JSON.parse(sessionStorage.getItem("requiredItems"));
    var mainsteps = JSON.parse(sessionStorage.getItem("mainSteps"));
    $scope.slideCount = mainsteps.length - 1;
    $scope.activeTabs = [];

    if($rootScope.slideIndex === undefined){ $rootScope.slideIndex = 0}

    var re = /(?:\.([^.]+))?$/;


    angular.forEach(mainsteps, function(step){
        step.video = {
            preload: "none",
            source: [
                {src: $sce.trustAsResourceUrl(step.videoPath), type: "video/" + re.exec(step.videoPath)[1]}
            ],
            theme: {
                url: "http://www.videogular.com/styles/themes/default/latest/videogular.css"
            }
        };
        step.audio = {
            source: [
                {src: $sce.trustAsResourceUrl(step.audioPath), type: "audio/" + re.exec(step.audioPath)[1]}
            ],
            theme: {
                url: "http://www.videogular.com/styles/themes/default/latest/videogular.css"
            }
        };
    });

    $scope.mainsteps = mainsteps;
    $scope.toggleHelp = function(tab) {
        if($scope.isShown(tab)){
            $scope.activeTabs.splice($scope.activeTabs.indexOf(tab),1);
        }
        else{
            wasShown = true;
            $scope.activeTabs.push(tab);
        }
    };

    $scope.isShown = function(tab) {
        if($scope.activeTabs.indexOf(tab) > -1){
            return true;
        } else{
            return false;
        }
    };

    $scope.getElapsedMs = function() {
        var dur = moment.duration((elapsedMs), 'milliseconds');
        return moment(dur.asMilliseconds()).format('mm:ss');
    };

    $scope.nextSlide = function() {
        if(wasShown) stepsUsed++;
        wasShown = false;
        totalElapsedMs += elapsedMs;
        $ionicSlideBoxDelegate.next();

        Api.completeMainStep({
            "MainStepID": $scope.mainsteps[$rootScope.slideIndex - 1].mainStepID,
            "TaskID": sessionStorage.getItem("taskId"),
            "MainStepName":  $scope.mainsteps[$rootScope.slideIndex - 1].mainStepName,
            "AssignedUser": user,
            "TotalTime": elapsedMs
        });
        reset();
    };

    $scope.prevSlide = function() {
        $ionicSlideBoxDelegate.previous();
    };

    $scope.slideChanged = function(index) {
        $rootScope.slideIndex = index;
    };

    $scope.finish = function(){
        if(wasShown) stepsUsed++;

        var results = {
            "Name": user,
            "stepsUsed": stepsUsed,
            "elapsedTime": totalElapsedMs
        };

        Api.completeMainStep({
            "MainStepID": $scope.mainsteps[$rootScope.slideIndex].mainStepID,
            "TaskID": sessionStorage.getItem("taskId"),
            "MainStepName":  $scope.mainsteps[$rootScope.slideIndex].mainStepName,
            "AssignedUser": user,
            "TotalTime": elapsedMs
        });

        Data.storeReults(results);
        $state.go('Run.Done');
    }

    $rootScope.refreshTask = function(){
        var confirmPopup = $ionicPopup.confirm({
            title: 'Refresh Task',
            template: 'Are you sure you want to refresh your current task'
        });
        confirmPopup.then(function(res) {
            if(res) {
                $rootScope.slideIndex = 0;
                $ionicSlideBoxDelegate.slide(0);
                $state.go('Run.Start',{allow: true});
                reset();
            }
        });
    };

    start();

    function start() {
        if (!timerPromise) {
            startTime = new Date();
            timerPromise = $interval(function() {
                var now = new Date();
                elapsedMs = now.getTime() - startTime.getTime();
            }, 31);
        }
    };

    function reset() {
        startTime = new Date();
        elapsedMs = 0;
    };

    if(annyang){
        var commands = $rootScope.commands;
        commands.help = function(){
            $scope.toggleHelp($scope.mainsteps[$rootScope.slideIndex])
        }
        commands.items = function(){
            document.getElementById("Items").click();
        }
        commands.next = function(){
            $scope.nextSlide();
        }
        commands.finish = function() {
            $scope.finish();
        }
        commands.audio = function() {
            var play = document.getElementsByClassName("play");
            play[$rootScope.slideIndex].click();
            console.log(play[$rootScope.slideIndex])
        }
        annyang.removeCommands();
        annyang.addCommands(commands);
    }
});

app.controller('FinishTaskCtrl', function($scope, $rootScope, $timeout, $ionicSlideBoxDelegate, $state, Api, $cookies){
    var data = JSON.parse(sessionStorage.getItem("results"));
    var dur = moment.duration((data.elapsedTime), 'milliseconds')
    var user = $cookies.username;

    $scope.results = data;
    $scope.name = data.Name;
    $scope.taskName = sessionStorage.getItem("taskName");
    $scope.steps = data.stepsUsed;
    $scope.time = moment(dur.asMilliseconds()).format('mm:ss');

    $scope.done = function(){
        Api.completeTask({
            "CategoryId": sessionStorage.getItem("catId"),
            "TaskID": sessionStorage.getItem("taskId"),
            "TaskName": sessionStorage.getItem("taskName"),
            "AssignedUser": user,
            "TotalTime": data.elapsedTime,
            'TotalDetailedStepsUsed': data.stepsUsed
        });
    }
    if(annyang){
        var commands = $rootScope.commands;
        commands.done = function(){
            $scope.done();
        }
        commands.redo = function(){
            $rootScope.refreshTask();
        }
        annyang.removeCommands();
        annyang.addCommands(commands);
    }
});

function filterChecked(element) {
    if (element.checked && typeof(element.checked) === 'boolean') {
        return true;
    } else {
        return false;
    }
}