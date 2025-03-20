app.controller("DomainController", ["$scope", "$rootScope", "$filter", "svc", "$location", "$http", "$routeParams", '$window', '$q', function ($scope, $rootScope, $filter, svc, $location, $http, $routeParams, $window, $q) {

    svc.states.updatePackages = false;
    SetStatusPanel(null, "", svc);

    $scope.domainPermissions = 4;
    $scope.sourcePermissions = 1;
    $rootScope.socketOff = true;

    $scope.loadingDomains = false;
    $scope.loadingRepositories = false;

    $scope.feedBaseUrl = feedBaseUrl;

    $scope.loadingRepositories = true;

    $scope.settings = {
        domain: {}
    };

    $scope.settings.domain.order = ['friendlyName', 'name'];
    $scope.settings.domain.reversed = false;
    $scope.settings.domain.view = 1;

    $scope.SaveSettings = function (obj) {
        SaveSiteSettings("domains", obj, svc, $q, $http).then((res) => {});
    };

    GetSiteSetting("domains", svc, $q, $http).then(setting => {
        if (setting) {
            for (let prop in setting) {
                $scope.settings[prop] = setting[prop]
            }
        }

        $scope.loadingSettingsDone = true;
    });

    svc.GetPackageSources();
    if (svc.data.packageSources) {
        svc.data.packageSources.then((res) => {
            //console.log("packageSources:");
            //console.log(res.data);

            $scope.packageSources = $filter('orderBy')(res.data, ['shared', '-external', 'name'], false);
            $scope.loadingRepositories = false;
            //HideLoading();
        }, (err) => {
            console.log(err);
            $scope.loadingRepositories = false;
        });
    }




    $scope.loadingDomains = true;
    svc.GetDomains();

    if (svc.data.domains) {
        svc.data.domains.then(res => {
            if (res.data.length > 0) {
                $scope.data = res.data;
                $scope.Reorder($scope.settings.domain.order, true, true);
            } else {
                $scope.data = [];
                $scope.OpenModal('WelcomeModal');
            }

            $scope.loadingDomains = false;
        });
    } else {
        $scope.loadingDomains = false;
    }

    $scope.AddDomain = function () {

        $scope.addingDomain = true;


        PostApi(svc, $http, $q, "secure/create/domain", {
            friendlyName: $scope.domain.name,
            domainDescription: ""
        }).then(function (NewObject) {
            if (NewObject) {
                svc.data.domains.then(function (res) {
                    // console.log("Pushing new domain: ");
                    // console.log(NewObject.data[0]);

                    if (!$scope.data) {
                        $scope.data = [];
                    }

                    if (!res.data) {
                        res.data = [];
                    }

                    res.data.push(NewObject.data[0]);
                    $scope.domain.name = "";
                    $scope.domain.description = "";
                    res.data = $filter('orderBy')(res.data, 'friendlyName');
                    $scope.data = res.data;
                    ShowNotification("Done.", 2000, 'is-success');

                    //HideLoading();
                    $scope.CloseModal('AddDomainModal');
                    $scope.addingDomain = false;
                });
            }

            //console.log(angular.toJson(NewObject));
        }, (err) => {
            $scope.domain.name = "";
            $scope.domain.description = "";
            ShowNotification("Could not add domain.", 0, 'is-danger');
            $scope.addingDomain = false;
        });
    }

    $scope.AddPackageSource = function () {

        //if ($scope.source.url && $scope.source.url.endsWith("/v2/")) {

        $scope.source.url.endsWith("/") ? false : $scope.source.url += "/";

        $scope.addSource = false;

        PostApi(svc, $http, $q, "secure/create/packageSource", {
            name: $scope.source.name,
            description: $scope.source.description,
            permission: 32,
            url: $scope.source.url,
            username: '',
            password: '',
            key: '',
            css: GetRandomColor().replace('-text', ''),
            external: true,
        }).then(function (NewObject) {
            if (NewObject) {
                svc.data.packageSources.then((res) => {
                    res.data.push(NewObject.data[0]);
                    $scope.packageSources = $filter('orderBy')(res.data, ['shared', '-external', 'name'], false);
                    ShowNotification("Done.", 2000, 'is-success');
                    $scope.CloseModal('AddRepoModal');
                });
            }
        });
        // } else {
        //     ShowNotification("Check the url, it should end with V2/", 0, "is-warning");
        // }
    }

    $scope.CreatePackageSource = function () {
        $scope.addSource = false;

        PostApi(svc, $http, $q, "secure/create/internalPackageSource", {
            name: $scope.repo.name,
        }).then(function (newRes) {
            if (newRes.data && newRes.data.length !== 0) {
                svc.data.packageSources.then((currentRes) => {
                    let newSource = newRes.data[0];
                    newSource = FormSource(newSource);
                    currentRes.data.push(newSource);
                    $scope.packageSources = $filter('orderBy')(currentRes.data, ['shared', '-external', 'name'], false);
                    ShowNotification("Done.", 2000, 'is-success');
                    $scope.CloseModal('AddMdcRepoModal');
                });
            }
        });
    }

    $scope.DeletePackageSourceConfirm = (packageSource) => {
        $scope.packageSourceToDelete = packageSource;
        $scope.OpenModal('DeletePackageSourceModal');
    }

    $scope.DeleteDomainConfirm = (domain) => {
        $scope.domainToDelete = domain;
        $scope.OpenModal('DeleteDomainModal');
    }

    $scope.DeletePackageSource = () => {
        var packageSource = $scope.packageSourceToDelete;

        PostApi(svc, $http, $q, "secure/delete/packageSource", {
            uid: packageSource.uid
        }).then(function (ReturnObject) {
            ShowNotification("Done.", 2000, "is-success");
            svc.data.packageSources.then((res) => {
                res.data.splice(res.data.indexOf(packageSource), 1);
                $scope.packageSources = $filter('orderBy')(res.data, ['shared', '-external', 'name'], false);
                $scope.CloseModal('DeletePackageSourceModal');
            });

            HideLoading();
        })
    }

    if (socket && socket.connected) {
        socket.disconnect();
    }

    $rootScope.Reconnect = () => {
        PrepAndConnectSocket(svc, $filter, $routeParams, $http, $q, $rootScope, false);
    }

    $scope.DeleteDomain = () => {
        var domain = $scope.domainToDelete;


        PostApi(svc, $http, $q, "secure/delete/domain", {
            uid: domain.uid
        }).then(ReturnObject => {
            $scope.CloseModal("DeleteDomainModal");
            ShowNotification("Done.", 2000, 'is-success');
            svc.data.domains.then(function (res) {
                res.data.splice(res.data.indexOf(domain), 1);
                $scope.data = res.data;

            })
        })
    }

    $scope.HideLoading = () => {
        HideLoading();
    }

    $scope.ShowLoading = () => {

    }

    $rootScope.ShowTitle = true;
    $rootScope.ShowSearchBtn = true;
    $rootScope.ShowBackBtn = false;
    $rootScope.ShowSendBtn = false;

    $scope.OpenModal = function (modalName) {
        OpenModal(modalName);
    }

    $scope.CloseModal = function (modalName) {
        CloseModal(modalName);
    }

    ChangeBackBtnUrl('/');

    // $scope.$on('$viewContentLoaded', function (event) {
    //     if (firstTime && !modalShown) {
    //         HideLoading();
    //         $('#initModal').$scope.OpenModal({ dismissible: false, in_duration: 700, out_duration: 700 });
    //         modalShown = true;
    //         setTimeout(function () { $('#initModal').closeModal() }, 3000);
    //     }
    // });

    $scope.$on('$viewContentLoading', function (event) {

    });

    $scope.ShareDomain = function (item) {
        $scope.domainToShare = item;
        $scope.OpenModal('ShareDomainModal');
    }

    $scope.GetDomainPermissionName = function (permission) {
        return GetDomainPermissionName(permission);
    }

    $scope.ShareDomainAndPackageSource = (domainUID, userMail) => {

        $scope.domainToShare.loading = true

        PostApi(svc, $http, $q, "secure/set/shareDomain", {
            domainUID: domainUID,
            mail: userMail,
            domainPermission: $scope.domainPermissions,
            sourcePermission: $scope.sourcePermissions
        }).then(function (res) {

            if (res.data && res.data.length != 0) {
                ShowNotification("Done.", 2000, "is-success");
                $scope.CloseModal('ShareDomainModal');
                $scope.domainPermissions = 4;
                $scope.sourcePermissions = 1;
            } else {
                ShowNotification("The user does not exist.", 0, 'is-warning');
            }

            $scope.mail = ''

            $scope.domainToShare.loading = false;

        }, (err) => {
            ShowNotification("Request failed.", 0, "is-danger");
            $scope.domainPermissions = 4;
            $scope.sourcePermissions = 1;
            $scope.domainToShare.loading = false;
        });
    }

    $scope.EditDomain = function (item, cancel) {

        if (!$scope.editMode || item.selected && $scope.editMode) {
            $scope.editDomain = !$scope.editDomain;
            $scope.editMode = $scope.editDomain;
            item.selected = $scope.editDomain;
        }

        if (!item.selected && cancel) {
            item.friendlyName = item.oldName;
        } else {
            item.oldName = item.friendlyName;
        }
    }

    $scope.EditSource = function (item, cancel) {
        if (!$scope.editMode || item.selected && $scope.editMode) {
            $scope.editRepo = !$scope.editRepo;
            $scope.editMode = $scope.editRepo;
            item.selected = $scope.editRepo;
        }

        if (!item.selected && cancel) {
            item.name = item.oldName;
        } else {
            item.oldName = item.name;
        }
    }


    $scope.Reorder = function (array, ignoreReverse, skipSave) {
        if (array[0] == $scope.settings.domain.order[0] && !ignoreReverse) {
            $scope.settings.domain.reversed = !$scope.settings.domain.reversed;
        }

        $scope.settings.domain.order = array;

        $scope.data = $filter('orderBy')($scope.data, array, $scope.settings.domain.reversed);

        if (!skipSave) {
            $scope.SaveSettings($scope.settings);
        }
    }

    $scope.SaveDomainName = function (domain) {
        console.log("Saving...");
        PostApi(svc, $http, $q, "secure/set/domainFriendlyName", {
            friendlyName: domain.friendlyName,
            domainUID: domain.uid
        }).then(function (ReturnObject) {
            ShowNotification("Done.", 3000, 'is-success');
            $scope.data = $filter('orderBy')($scope.data, 'friendlyName');
        })
    }

    $scope.SaveSourceName = function (source) {
        console.log("Saving...");
        PostApi(svc, $http, $q, "secure/set/sourceName", {
            name: source.name,
            sourceUID: source.uid
        }).then(function (ReturnObject) {
            ShowNotification("Done.", 3000, 'is-success');
        })
    }

    $scope.FocusForm = function (form, id) {
        FocusForm(form, id)
    };

    Focus('search');

    $scope.Goto = function (event) {
        event.preventDefault();
        Goto($location, event.currentTarget.pathname)
    };

}])