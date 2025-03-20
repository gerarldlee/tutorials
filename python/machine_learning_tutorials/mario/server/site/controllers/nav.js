app.controller("NavController", ["$scope", "$rootScope", "svc", "$location", function ($scope, $rootScope, svc, $location) {

    $scope.user = svc.states.user;

    $scope.Goto = function (event) {
        event.preventDefault();
        Goto($location, event.currentTarget.pathname)
    };

    $scope.CloseNotification = CloseNotification;
    $scope.ShowMenu = ShowMenu;

    // $rootScope.SendComplain = function () {
    //     $rootScope.Send = true;
    // };

}]);