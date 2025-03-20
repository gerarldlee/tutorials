app.controller("ResetPasswordController", ["$scope", '$routeParams', "$rootScope", '$location', '$http', '$httpParamSerializer', '$q', function ($scope, $routeParams, $rootScope, $location, $http, $httpParamSerializer, $q) {

    HideLoading();

    $scope.isLoading = false;

    $scope.ResetPassword = function (newPassword, challange) {

        $scope.isLoading = true;

        if ($routeParams.autoChallange && $routeParams.autoChallange != "") {
            Post($http, appBaseUrl + 'user/resetpassword', {
                data: {
                    newPassword: newPassword,
                    challange: challange,
                    autoChallange: $routeParams.autoChallange

                }
            }).then((res) => {
                ShowNotification("Done!", 3000, "is-success");
                $scope.challange = null;
                $scope.password = null;
                $scope.passwordRepeat = null;
                Goto($location, "/login");
                $scope.isLoading = false;
            }).catch(err => {
                if (err.status == 500) {
                    ShowNotification("Internal server error, please try again later.", "", "is-danger");
                } else if (err.status == 403) {
                    ShowNotification("Code or password reset link is invalid.", "", "is-warning");
                }

                $scope.isLoading = false;
            });
        } else {
            ShowNotification("Code or password reset link is invalid.", "", "is-warning");
            $scope.isLoading = false;
        }
    }

}]);