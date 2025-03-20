app.controller("SignupController", ["$scope", "$rootScope", "$filter", "svc", "$location", "$http", function ($scope, $rootScope, $filter, svc, $location, $http) {


    $scope.isLoading = false;
    $scope.regex = new RegExp("^[a-zA-Z\s]+$");
    $scope.serverSettings = svc.states.serverSettings;

    $scope.Signup = function () {

        $scope.isLoading = true;

        var data = {
            mail: $scope.mail,
            password: $scope.password,
            firstName: $scope.firstName,
            lastName: $scope.lastName
        };
        data = {
            data
        };

        Post($http, appBaseUrl + 'signup/', data).then((res) => {
            $scope.isLoading = false;
            if (res.status == 201) {

                $scope.mail = '';
                $scope.password = '';
                $scope.firstName = '';
                $scope.lastName = '';

                ShowNotification('Sign up completed!', 2000);

                Goto($location, "/login");
            }

        }).catch((res) => {
            $scope.isLoading = false;
            if (res.status == 409) {
                $scope.mail = "";
                ShowNotification('The user already exists.', 5000);
                HideLoading();
            } else {
                $scope.isLoading = false;
                ShowNotification('Could not sign up, please try again later. Error code: ' + res.status, 0, 'is-warning');
                HideLoading();
            }
        });


    }

    $scope.ShowMessage = function (message) {
        ShowNotification(message, 3000);
    }

    $scope.NavigateToDomain = function (domain) {
        Goto($location, "domain/" + domain.uid + "/computers");
        HideLoading();
    }



    $scope.HideLoading = function () {
        HideLoading();
    }

    $scope.ShowLoading = function () {
        ShowLoading();
    }

    $rootScope.ShowTitle = true;
    $rootScope.ShowSearchBtn = false;
    $rootScope.ShowBackBtn = true;
    $rootScope.ShowSendBtn = false;

    ChangeBackBtnUrl('/login');

    $scope.$on('$viewContentLoading', function (event) {        
    });

    $scope.Goto = function (event) {
        event.preventDefault();
        Goto($location, event.currentTarget.pathname)
    };

    FocusForm("signupForm", "firstName");

}]);