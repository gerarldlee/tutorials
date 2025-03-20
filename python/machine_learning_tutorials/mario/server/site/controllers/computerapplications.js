app.controller("ComputerApplicationController", ["$scope", '$routeParams', "$route", "$rootScope", '$location', "svc", "$filter", "$http", "$timeout", "$q", function ($scope, $routeParams, $route, $rootScope, $location, svc, $filter, $http, $timeout, $q) {

    $scope.settings = {
        computerApplications: {}
    };

    $scope.SaveSettings = function (obj) {
        SaveSiteSettings("computerApplications", obj, svc, $q, $http).then((res) => {});
    };

    GetSiteSetting("computerApplications", svc, $q, $http).then(setting => {
        if (setting) {
            for (let prop in setting) {
                $scope.settings[prop] = setting[prop]
            }
        }

        $scope.loadingSettingsDone = true;
    });

    svc.GetApplications();
    svc.GetComputers();
    $scope.editMode;
    $scope.domain;
    $scope.currentPage = 1;
    $scope.maxItems = 25
    $scope.indexStart = 0
    $scope.saving = false;
    $scope.order = {
        array: ["key", "installed"],
        reversed: true
    };


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

    $scope.ChangePage = function (page) {
        $scope.indexStart = $scope.GetPageStartIndex(page);
        $scope.currentPage = page;
        Focus('search');
    }


    $scope.LoadingDone = function (done) {
        $scope.loadingDone = done;
    }

    GetDomain($routeParams.domainUID, svc, $filter).then(domain => {
        $scope.domain = domain;

        if (domain.permission && domain.permission < 16) {
            // ShowNotification("Only read permissions for this domain", 2000);
        }
    });

    if (svc.data.computers) {
        $scope.LoadingDone(false);
        svc.data.computers.then(function (res) {
            if (res.data.length > 0) {
                let computer = res.data[0].computers.find(x => x.uid === $routeParams.computerUID)
                if (computer) {
                    $scope.computer = computer;
                }
            }
            $scope.LoadingDone(true);
        });
    } else {
        console.log("No computers");
    }


    if (svc.data.applications) {
        $scope.LoadingDone(false);
        svc.data.applications.then((res) => {
            if (res.data.length > 0) {
                $scope.applications = res.data[0].applications
                $scope.pageNumbers = $scope.GetPageNumbers(res.data[0].applications);
                $scope.Reorder($scope.order.array, true);
                HideLoading();
            } else {
                $scope.applications = [];
            }

            $scope.LoadingDone(true);
        });
    }

    $scope.Edit = function (application, cancel) {

        if (!$scope.editMode || application.editMode && $scope.editMode) {
            $scope.editMode = !$scope.editMode
            application.editMode = !application.editMode
        }

        if (cancel) {
            application.key = application.tempLicense;
        } else {
            application.tempLicense = application.key;
        }
    }

    $scope.Reorder = function (array, ignoreReverse) {
        if (array[0] == $scope.order.array[0] && !ignoreReverse) {
            $scope.order.reversed = !$scope.order.reversed;
        }

        $scope.order.array = array;

        if (!$scope.editMode) {
            $scope.applications = $filter('orderBy')($scope.applications, array, $scope.order.reversed);
        }
    };


    $scope.SaveLicenseKey = function (application) {
        if ($scope.domain.permission && $scope.domain.permission >= 16 || !$scope.domain.permission && !$scope.domain.shared) {
            $scope.saving = true;
            PostApi(svc, $http, $q, "secure/set/applicationLicense", {
                computerUID: $routeParams.computerUID,
                name: application.name,
                domainUID: $routeParams.domainUID,
                version: application.version,
                key: application.key
            }).then(function (ReturnObject) {
                ShowNotification("Done.", 5000, 'is-success');
                $scope.saving = false;
                $scope.Edit(application);
            })
        } else {
            // ShowNotification("Permission denied.", 5000, 'is-warning');
        }
    }

    $scope.Filter = function (str) {
        svc.data.applications.then((res) => {
            if (str) {
                $scope.applications = res.data[0].applications.filter((x) => x.name.toLowerCase().includes(str.toLowerCase()));
            } else {
                $scope.applications = res.data[0].applications;
            }

            $scope.pageNumbers = $scope.GetPageNumbers($scope.applications);
            $scope.ChangePage(1);

            $scope.Reorder($scope.order.array, true);
        }, true);
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
        svc.data.applications.then((res) => {
            if (res.data.length > 0) {

                // let filteredArr = $filter('filter')(res.data[0].applications, {
                //     installed: true
                // }, true);

                let text = "Name; Version; License; Installed\r\n";
                for (let app of res.data[0].applications) {
                    let installStr = app.installed ? 'Yes' : 'No';
                    text += $scope.CheckIfEmpty(app.name) + ";" + $scope.CheckIfEmpty(app.version) + ";" + $scope.CheckIfEmpty(app.key) + ";" + installStr + "\r\n";
                }


                HideLoading();
                DownloadText(text);
            }

            $scope.LoadingDone(true);
        });
    }

    ChangeBackBtnUrl("domains/" + $routeParams.domainUID + "/computers");

    $scope.HideLoading = function () {
        HideLoading();
    }

    $scope.ShowLoading = function () {
        ShowLoading();
    }

    $scope.OpenModal = function (modalName) {
        OpenModal(modalName);
    }

    $scope.CloseModal = function (modalName) {
        CloseModal(modalName);
    }

    Focus('search');

    $scope.FocusForm = function (form, id) {
        FocusForm(form, id)
    };

    $rootScope.ShowBackBtn = true;
    $rootScope.ShowTitle = false;
    $rootScope.ShowSendBtn = false;
    $rootScope.ShowSearchBtn = false;

    $scope.$on('$destroy', function () {
        svc.data.applications = null;
    });

    $scope.Goto = function (event) {
        event.preventDefault();
        Goto($location, event.currentTarget.pathname)
    };

}]);