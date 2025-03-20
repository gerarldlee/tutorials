app.controller("LogoutController", ["svc", "$location", "$http", "$q", function (svc, $location, $http, $q) {

    HideLoading();

    Logout(svc, $http, $q);
    Goto($location, '/login');
}]);