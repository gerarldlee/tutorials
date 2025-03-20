app.controller("UnavailableController", ["$scope", "$rootScope", "$filter", "svc", "$location", "$http", function ($scope, $rootScope, $filter, svc, $location, $http) {

    if (!svc.states.serverSettings.sealed) {
        Goto($location, "/login");
    }

}]);