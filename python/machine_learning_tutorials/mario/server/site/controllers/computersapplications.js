app.controller("ComputersApplicationsController", ["$scope", '$routeParams', "$route", "$rootScope", '$location', "svc", "$filter", "$http", "$timeout", "$q", function ($scope, $routeParams, $route, $rootScope, $location, svc, $filter, $http, $timeout, $q) {


    let processedData = [];
    let filtered = [];
    svc.GetComputersApplications();
    $scope.currentPage = 1;
    $scope.maxItems = 25
    $scope.indexStart = 0
    $scope.order = {
        array: ["key", "installed"],
        reversed: true
    };

    $scope.domain = {};

    GetDomain($routeParams.domainUID, svc, $filter).then(domain => {
        $scope.domain = domain;

        if (domain.permission && domain.permission < 16) {
            // ShowNotification("Only read permissions for this domain", 2000);
        }
    });

    $scope.GetPageNumbers = function (items) {

        let numberArray = [];
        let total = items.length;

        if (total != 0) {
            let numbers = total / $scope.maxItems;

            let i;

            for (i = 0; i < numbers; i++) {
                numberArray.push((i + 1).toString());
            }

        } else {
            numberArray.push("1");
        }

        return numberArray;
    }

    $scope.GetPageStartIndex = function (page) {
        page = page - 1;
        let start = (page * $scope.maxItems);
        return start;
    }

    $scope.ChangePage = function (page, skipReload) {
        $scope.indexStart = $scope.GetPageStartIndex(page);
        $scope.currentPage = page;

        if (!skipReload) {
            $scope.SetScopeData();
        }

        Focus('search');
    }

    $scope.SetScopeData = () => {
        if (filtered.length !== 0) {
            $scope.applications = filtered.filter((x, index) => index >= $scope.indexStart && index < $scope.indexStart + $scope.maxItems);
        } else {
            $scope.applications = processedData.filter((x, index) => index >= $scope.indexStart && index < $scope.indexStart + $scope.maxItems);
        }
    }

    $scope.LoadingDone = function (done) {
        $scope.loadingDone = done;
    }

    $scope.GetApps = (item) => {
        $scope.selectedItem = item;
        OpenModal('DetailsModal');
        Focus('searchDetails');

        if (!item.items) {
            $scope.LoadingDone(false);
            svc.data.computersApplications.then((res) => {
                item.items = res.data[0].filter((x) => x.application.name === item.application.name && x.application.version === item.application.version);
                $scope.LoadingDone(true);
            });
        }
    }

    if (svc.data.computersApplications) {
        $scope.LoadingDone(false);
        $scope.applications = [];

        svc.data.computersApplications.then(async (res) => {
            if (res.data.length > 0) {
                processedData = $scope.ProcessData(res.data[0]);
                $scope.pageNumbers = $scope.GetPageNumbers(processedData);
                $scope.Reorder($scope.order.array, true);
                $scope.LoadingDone(true);

            } else {
                $scope.applications = [];
                $scope.LoadingDone(true);
            }
        });
    }

    $scope.Reorder = function (array, ignoreReverse) {
        if (array[0] == $scope.order.array[0] && !ignoreReverse) {
            $scope.order.reversed = !$scope.order.reversed;
        }

        $scope.order.array = array;

        if (filtered.length !== 0) {
            filtered = $filter('orderBy')(filtered, array, $scope.order.reversed);
        } else {
            processedData = $filter('orderBy')(processedData, array, $scope.order.reversed);
        }

        $scope.SetScopeData();
    }

    $scope.ProcessData = function (arr) {
        let data = [];

        for (let item of arr) {
            if (item.application && item.application.name) {
                let existingItem = data.find((x) => x.application.name === item.application.name && x.application.version === item.application.version);

                if (!existingItem) {

                    let itemToAdd = {
                        application: {}
                    };

                    let all = arr.filter((x) => x.application.name === item.application.name && x.application.version === item.application.version);
                    let installed = all.filter((x) => x.application.installed);
                    let withLicense = all.filter((x) => x.application.key && x.application.key !== '');

                    itemToAdd.application.installed = installed.length;
                    itemToAdd.application.notInstalled = all.length - installed.length;
                    itemToAdd.application.withLicense = withLicense.length;
                    itemToAdd.application.name = item.application.name;
                    itemToAdd.application.version = item.application.version;
                    itemToAdd.application.id = item.application.id;

                    data.push(itemToAdd);
                }
            }
        }

        return data;
    }


    $scope.Filter = (str) => {
        if (str) {
            filtered = processedData.filter((x) => x.application.name.toLowerCase().includes(str.toLowerCase()));

        } else {
            filtered = [];
        }

        if (filtered.length !== 0) {
            $scope.pageNumbers = $scope.GetPageNumbers(filtered);
        } else {
            $scope.pageNumbers = $scope.GetPageNumbers(processedData);
        }

        $scope.ChangePage(1, true);
        $scope.Reorder($scope.order.array, true);
    }

    $scope.CheckIfEmpty = function (str) {
        if (!str) {
            return "";
        } else {
            return str;
        }
    }

    $scope.Download = function () {
        ShowLoading();
        svc.data.computersApplications.then((res) => {
            if (res.data.length > 0) {

                // let filteredArr = $filter('filter')(res.data[0].applications, {
                //     installed: true
                // }, true);

                let text = "Name; Version; License; Installed\r\n";
                for (let item of res.data[0]) {
                    let installStr = item.application.installed ? 'Yes' : 'No';
                    text += $scope.CheckIfEmpty(item.computer.name) + ";" + $scope.CheckIfEmpty(item.application.name) + ";" + $scope.CheckIfEmpty(item.application.version) + ";" + $scope.CheckIfEmpty(item.application.key) + ";" + installStr + "\r\n";
                }


                HideLoading();
                DownloadText(text);
            }

            $scope.LoadingDone(true);
        });
    }



    $scope.SaveLicenseKey = function (application) {
        ShowLoading();
        console.log("Saving...");
        PostApi(svc, $http, $q, "secure/set/applicationLicense", {
            computerUID: $routeParams.computerUID,
            name: application.name,
            version: application.version,
            key: application.key
        }).then(function (ReturnObject) {
            console.log("Saving is done.");
            HideLoading();
        })
    }

    Focus('search');

    ChangeBackBtnUrl("domains/" + $routeParams.domainUID + "/computers");

    $scope.HideLoading = function () {
        HideLoading();
    }

    $scope.ShowLoading = function () {
        ShowLoading();
    }

    $rootScope.ShowBackBtn = true;
    $rootScope.ShowTitle = false;
    $rootScope.ShowSendBtn = false;
    $rootScope.ShowSearchBtn = false;

    $scope.$on('$destroy', function () {
        svc.data.computersApplications = null;
    });

    $scope.Goto = function (event) {
        event.preventDefault();
        Goto($location, event.currentTarget.pathname)
    };

    $scope.OpenModal = function (modalName) {
        OpenModal(modalName);
    }

    $scope.CloseModal = function (modalName) {
        CloseModal(modalName);
    }

}]);