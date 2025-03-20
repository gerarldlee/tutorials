app.controller("SourcePackageController", ["$scope", '$routeParams', "$route", "$rootScope", '$location', "svc", "$filter", "$http", "$timeout", "$q", function ($scope, $routeParams, $route, $rootScope, $location, svc, $filter, $http, $timeout, $q) {

    $scope.items = [];
    $scope.loadingDone = false;
    $scope.selected = {};
    $selectedSource = {}



    GetSourceFromUID(svc, $filter, $q, $routeParams.sourceUID).then(source => {
        $scope.source = source;

        svc.GetPackageSources();
        if (svc.data.packageSources) {
            svc.data.packageSources.then(sourceRes => {
                $scope.sources = sourceRes.data;
                $scope.internalSources = $scope.sources.filter(x => !x.external && x.version >= 2 && x.uid != $scope.source.uid);
            });
        }

        filter = "Packages?$top=15&$filter=IsAbsoluteLatestVersion%20eq%20true&$orderby=DownloadCount%20desc";
        PostApi(svc, $http, $q, "secure/choco/packages", {
            query: filter,
            source
        }).then(res => {
            $scope.items = res.data.packages;
            $scope.loadingDone = true;
        })
    });

    $scope.GetOtherVersions = function (item) {

        if (!item.otherVersions) {
            item.otherVersions = [];
        }

        item.otherVersions.isLoading = true;

        let encoded = "Packages?$filter=Id%20eq%20%27" + item.chocoPackage.Id + "%27&$orderby=Published%20desc&$top=10&$skip=" + item.otherVersions.length;
        PostApi(svc, $http, $q, "secure/choco/packages", {
            query: encoded,
            source: item.source
        }).then(chocoResult => {
            item.otherVersions = item.otherVersions.concat(chocoResult.data.packages);
            item.otherVersions = OrderByVersion(item.otherVersions);
            item.otherVersions.isLoading = false;
        })
    }

    $scope.Search = function (value) {

        let filter;
        $scope.loadingDone = false;
        $scope.items = [];

        value = value.toLowerCase()

        if (value || value != '') {
            value = encodeURIComponent(value);
            filter = `Search()?$filter=IsAbsoluteLatestVersion&searchTerm=%27${value}%27&targetFramework=''&includePrerelease=true&$skip=0&$top=15&semVerLevel=2.0.0`            
            PostApi(svc, $http, $q, "secure/choco/packages", {
                query: filter,
                source: $scope.source
            }).then(res => {
                //console.log(filter)
                //console.log(res.data.packages)
                $scope.items = res.data.packages;
                $scope.loadingDone = true;
            })
        } else {
            filter = "Packages?$top=15&$filter=IsAbsoluteLatestVersion%20eq%20true&$orderby=DownloadCount%20desc";
            PostApi(svc, $http, $q, "secure/choco/packages", {
                query: filter,
                source: $scope.source
            }).then(res => {
                $scope.items = res.data.packages;
                $scope.loadingDone = true;
            })
        }
    }

    $scope.OpenMove = function (item) {
        $scope.selected = item;
        OpenModal("MoveModal");
    }

    $scope.MovePackage = function (item) {
        item.moving = true;

        Post($http, item.source.url + "package/move", {
            Id: item.chocoPackage.Id,
            Version: item.chocoPackage.Version,
            packageHash: item.chocoPackage.PackageHash,
            source: $scope.selectedSource,
        }).then(res => {
            PostApi(svc, $http, $q, "secure/delete/sourcePackage", {
                packageHash: item.chocoPackage.PackageHash,
            }).then(res => {
                $scope.items.splice($scope.items.indexOf(item), 1);
                $scope.CloseModal('MoveModal');
                item.moving = false;
                ShowNotification("Done!", 3000, "is-success");                
            }, (err) => {
                item.moving = false;
                if (err.status === 401) {
                    ShowNotification("Could not delete package: Permission denied.", 0, 'is-warning');
                } else {
                    ShowNotification("Could not delete package: Internal error.", 0, 'is-warning');
                }
            })
        }, (err) => {
            item.moving = false;
            if (err.status === 401) {
                ShowNotification("Could not move package: Permission denied.", 0, 'is-warning');
            } else {
                ShowNotification("Could not move package: Internal error.", 0, 'is-warning');
            }
        })
    }

    $scope.GetDate = function (jsonDate) {
        var offset = new Date().getTimezoneOffset();
        var parts = /\/Date\((-?\d+)([+-]\d{2})?(\d{2})?.*/.exec(jsonDate);

        if (parts[2] == undefined)
            parts[2] = 0;

        if (parts[3] == undefined)
            parts[3] = 0;

        return $scope.IsoToDate(new Date(+parts[1] + offset + parts[2] * 3600000 + parts[3] * 60000));
    };

    $scope.IsoToDate = function (date) {
        if (date && date != "") {
            date = ConvertToDate(date);
            return date.toLocaleDateString([], {
                //weekday: "narrow",
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: false
            });
        }

        return "";
    }

    $scope.FormSource = FormSource;


    $scope.$on('$viewContentLoading', function (event) {});

    $scope.Goto = function (event) {
        event.preventDefault();
        Goto($location, event.currentTarget.pathname)
    };
    
    $scope.ShowVersionDd = ShowVersionDd;

    Focus('search');

    $scope.OpenModal = function (modalName) {
        OpenModal(modalName);
    }

    $scope.CloseModal = function (modalName) {
        CloseModal(modalName);
    }

}]);