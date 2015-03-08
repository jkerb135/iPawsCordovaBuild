/**
 * Created by Josh on 2/23/2015.
 */
app.service('loginModal', function($modal){
   function assignUser(user){
       sessionStorage.setItem("username", user);
       return user;
   };

    return function() {
        var instance = $modal.open({
            templateUrl: 'views/sign-in.html',
            controller: 'SignInCtrl'
        })

        return instance.result.then(assignCurrentUser);
    };
});

app.factory('Auth', function($ionicPopup, $timeout, $state, $cookies){
    return{
        login: function(data) {
            $.ajax({
                type: "POST",
                url: api + "handlers/users.ashx",
                data: data,
                dataType: "json",
                success: function (response) {
                    if(response.d !== "sign in success"){

                        var popup = $ionicPopup.show({
                            title: 'Invalid username and password',
                            subTitle: 'Please re-enter your credentials'
                        });

                        $timeout(function() {
                            popup.close(); //close the popup after 3 seconds for some reason
                        }, 1500);

                        return;
                    }
                    $.get("http://ipinfo.io", function (data) {
                        sessionStorage.setItem("IP", data.ip)
                        var post = {
                            "IpAddress": sessionStorage.getItem("IP"),
                            "SignedIn": true,
                            "Username": data.username
                        }
                        //Post Login Status
                        $.ajax({
                            type: "POST",
                            url: api + 'api/User/PostLoggedInIp',
                            data: JSON.stringify(post),
                            contentType: "application/json;charset=utf-8",
                            processData: true
                        });
                    }, "jsonp");

                    var popup = $ionicPopup.show({
                        title: 'Welcome ' + data.username
                    });

                    $timeout(function() {
                        popup.close(); //close the popup after 3 seconds for some reason
                    }, 1500);

                    $cookies.username = data.username;

                    $state.go('Menu');

                    //connection.server.addUser(uname);
                    //refresh(uname,uname + " has logged in");
                    //getUserData(uname);
                },
                error: function (response) {
                    console.log("Failed To Login")
                }
            });
    }
    }

});

app.factory('Api', function($http, $state){
    return{
        getUserData: function(uname, success, error) {
            var promise = $http.get(api + '/api/user/GetByUser/' + uname);
            if(success)
                promise.success(success);
            if(error)
                promise.error(error);
        },
        getTaskData: function(taskid, success, error){
            var promise =  $http.get(api + '/api/user/GetTaskDetails/' + taskid);
            if(success)
                promise.success(success);
            if(error)
                promise.error(error);
        },
        getCompletedSteps: function(username, taskId, success, error){
            var promise =  $http.get(api + 'api/user/GetAllCompletedSteps/' + username + '/' + taskId);
            if(success)
                promise.success(success);
            if(error)
                promise.error(error);
        },
        completeTask: function(data){
            $http.post( api + 'api/User/PostTaskCompleted', data).success(function(){
                $state.go('Tasks');
            });
        },
        completeMainStep: function(data){
            $http.post(api + 'api/User/PostMainStepCompleted',data);
        },
        getCompletedTasks: function(username, success, error){
            var promise =  $http.get(api + 'api/user/GetTasksCompleted/' + username);
            if(success)
                promise.success(success);
            if(error)
                promise.error(error);
        }
    }

});

app.factory('Data', function(){
    var storeCurrentUser = function(username){
        sessionStorage.setItem("username", username);
    };

    var storeCategories = function(categories){
        sessionStorage.setItem("categories", JSON.stringify(categories));
    };

    var storeCategoryId = function(catId){
        sessionStorage.setItem("catId",catId);
    };

    var storeTask = function(task){
        sessionStorage.setItem("task",JSON.stringify(task));
    };

    var storeTaskId = function(taskId){
        sessionStorage.setItem("taskId",taskId);
    };

    var storeTaskName = function(taskName){
        sessionStorage.setItem("taskName",taskName);
    };

    var storeMainSteps = function(mainSteps){
        sessionStorage.setItem("mainSteps", JSON.stringify(mainSteps));
    };

    var storeRequiredItems = function(required){
        sessionStorage.setItem("requiredItems", JSON.stringify(required));
    };

    var storeReults = function(results){
       sessionStorage.setItem("results", JSON.stringify(results));
    };

    var storeCompltedTasks = function(tasks){
        sessionStorage.setItem("completed", JSON.stringify(tasks));
    };

    return {
        storeCurrentUser: storeCurrentUser,
        storeCategories: storeCategories,
        storeTask: storeTask,
        storeCategoryId: storeCategoryId,
        storeTaskId: storeTaskId,
        storeTaskName: storeTaskName,
        storeMainSteps: storeMainSteps,
        storeRequiredItems: storeRequiredItems,
        storeReults: storeReults,
        storeCompltedTasks: storeCompltedTasks
    };
});
