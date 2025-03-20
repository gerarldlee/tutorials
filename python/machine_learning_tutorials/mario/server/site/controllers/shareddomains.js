app.controller("SharedDomainsController", ["$scope", '$routeParams', "$route", "$rootScope", '$location', "svc", "$filter", "$http", "$timeout", "$q", function ($scope, $routeParams, $route, $rootScope, $location, svc, $filter, $http, $timeout, $q) {

    $scope.currentSourcePermission = 0;

    //$scope.domain = null;

    $scope.loadingDone = false;

    svc.GetDomains();
    GetDomain($routeParams.domainUID, svc, $filter).then(domain => {
        $scope.domain = domain;
        $scope.$apply();
    }, (err) => {
        console.log(err);
    });

    svc.GetPackageSources();
    if (svc.data.packageSources) {
        svc.data.packageSources.then(sourceRes => {
            if (sourceRes && sourceRes.data && sourceRes.data.length > 0) {
                $scope.currentSourcePermission = sourceRes.data[0].permission;
            }
        });
    }

    $scope.GetUsers = function ($event) {
        PostApi(svc, $http, $q, "secure/get/sharedDomainsAndUsers", {
            domainUID: $routeParams.domainUID
        }).then((res) => {
            $scope.items = res.data;

            if ($scope.items.length === 0) {
                $scope.OpenModal('ShareDomainModal'); 
                $scope.FocusForm('shareForm', 'mail')
            }

            $scope.loadingDone = true;
        }, (err) => {
            $scope.loadingDone = true;
        });
    }
    $scope.GetUsers();

    $scope.DeleteShare = function (item) {
        PostApi(svc, $http, $q, "secure/delete/domainShare", {
            domainUID: $routeParams.domainUID,
            userUID2: item.user.uid
        }).then((res) => {
            ShowNotification("Done.", 2000, "is-success");
            $scope.items.splice($scope.items.indexOf(item), 1)
        }, (err) => {

        });
    }


    $scope.domainPermissions = 4;
    $scope.sourcePermissions = 1;

    $scope.ShareDomainAndPackageSource = (domainUID, userMail) => {

        $scope.domain.loading = true

        PostApi(svc, $http, $q, "secure/set/shareDomain", {
            domainUID: domainUID,
            mail: userMail.toLowerCase(),
            domainPermission: $scope.domainPermissions,
            sourcePermission: $scope.sourcePermissions
        }).then(function (res) {
            if (res.data && res.data.length != 0) {
                $scope.GetUsers();
                ShowNotification("Done.", 2000, "is-success");
                $scope.CloseModal('ShareDomainModal');
                $scope.domainPermissions = 4;
                $scope.sourcePermissions = 1;
            } else {
                ShowNotification("The user does not exist.", 7000, 'is-warning');
            }

            $scope.mail = ''

            $scope.domain.loading = false;

        }, (err) => {
            ShowNotification("Request failed.", 0, "is-danger");
            $scope.domainPermissions = 4;
            $scope.sourcePermissions = 1;
            $scope.domain.loading = false;
        });
    }

    $scope.OpenModal = function (modalName) {
        OpenModal(modalName);
    }

    $scope.CloseModal = function (modalName) {
        CloseModal(modalName);
    }

    $scope.GetDomainPermissionName = function (permission) {
        return GetDomainPermissionName(permission);
    }

    $scope.GetSourcePermissionName = function (permission) {
        return GetSourcePermissionName(permission);
    }

    $scope.FocusForm = function (form, id) {
        FocusForm(form, id)
    };

    $rootScope.ShowBackBtn = true;
    $rootScope.ShowTitle = false;
    $rootScope.ShowSendBtn = false;
    $rootScope.ShowSearchBtn = false;

    $scope.Goto = function (event) {
        event.preventDefault();
        Goto($location, event.currentTarget.pathname)
    };

}]);