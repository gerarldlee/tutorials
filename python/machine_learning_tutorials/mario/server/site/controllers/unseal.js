app.controller("UnsealController", ["$scope", "$rootScope", "$filter", "svc", "$location", "$http", function ($scope, $rootScope, $filter, svc, $location, $http) {


    $scope.isLoading = false;

    if (!svc.states.serverSettings.sealed || !svc.states.serverSettings.webUnsealEnabled) {
        Goto($location, "/login");
    }

    $scope.Unseal = function (keys) {

        $scope.isLoading = true;

        keys = keys.split("\n").filter(x => x != "").map(x => x.trim());

        let data = {
            keys
        };

        Post($http, appBaseUrl + 'unseal/', data).then((res) => {
            $scope.isLoading = false;
            if (res.status == 200) {
                $scope.keys = '';
                ShowNotification('Unsealing is done.', 0, "is-success");
                GetServerSettings(svc, $http);
            } else if (res.status == 202) {
                ShowNotification(`Need ${res.data.left} more ${res.data.left > 1 ? 'keys': 'key'} to unseal the vault.`, 0, "is-info");
                HideLoading();
            }

        }).catch((res) => {
            $scope.isLoading = false;
            if (res.status == 400) {
                ShowNotification('Missing keys.', 0, "is-warning");
                HideLoading();
            } else if (res.status == 401) {
                ShowNotification('Incorrect keys.', 0, "is-warning");
                HideLoading();
            } else {
                $scope.isLoading = false;
                ShowNotification('Could not unseal. Error code: ' + res.status, 0, 'is-danger');
                HideLoading();
            }
        });
    }




    $scope.HideLoading = function () {
        HideLoading();
    }

    $scope.ShowLoading = function () {
        ShowLoading();
    }

    $scope.$on('$viewContentLoading', function (event) {});

    $scope.Goto = function (event) {
        event.preventDefault();
        Goto($location, event.currentTarget.pathname)
    };

    FocusForm("keysForm", "keys");

}]);