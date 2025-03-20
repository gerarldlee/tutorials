app.controller("ComputerController", ["$scope", '$routeParams', "$route", "$rootScope", '$location', "svc", "$filter", "$http", "$q", function ($scope, $routeParams, $route, $rootScope, $location, svc, $filter, $http, $q) {

    let checkComputersInterval;
    svc.states.updatePackages = false;
    $scope.serverSettings = svc.states.serverSettings;

    SetStatusPanel();

    $scope.domainUID = $routeParams.domainUID;

    var date = new Date();
    date.setDate(date.getDate() + 1);
    InitDatePicker(date);
    $scope.keyDate = date.toLocaleDateString();

    $scope.loadingComputers = false;
    $scope.loadingGroups = false;

    $scope.initAddGroupModal = false;

    PrepAndConnectSocket(svc, $filter, $routeParams, $http, $q, $rootScope, false);

    $scope.LoadingGroupsDone = function (done) {
        $scope.loadingGroupsDone = done;
    }

    $scope.LoadingDone = function (done) {
        $scope.loadingDone = done;
    }

    $scope.SaveSettings = function (obj) {
        SaveSiteSettings("groupsAndComputers", obj, svc, $q, $http);
    };


    $scope.settings = {
        computer: {},
        group: {}
    };

    $scope.settings.computer.order = ['friendlyName', 'name'];
    $scope.settings.computer.reversed = false;
    $scope.settings.computer.view = 1;

    $scope.settings.group.order = ['friendlyName', 'name'];
    $scope.settings.group.reversed = false;
    $scope.settings.group.view = 1;

    $scope.serverLicense = {
        isLoading: false
    };
    $scope.GetServerLicense = function () {
        $scope.serverLicense.isLoading = true;
        PostApi(svc, $http, $q, "secure/get/serverLicense", {}).then(function (res) {
            if (res.data) {
                $scope.serverLicense = res.data;
            } else {

            }
            $scope.serverLicense.isLoading = false;
        }, () => {
            $scope.serverLicense.isLoading = false;
        });
    }

    $scope.ReloadServerLicense = function (computer) {
        $scope.serverLicense.isReloading = true;
        PostApi(svc, $http, $q, "secure/reload/serverLicense", {}).then(function (res) {
            if (res.data) {

                if ($scope.serverLicense.total !== res.data.free) {

                    if (computer) {
                        PostApi(svc, $http, $q, "secure/get/computerLicense", {
                            domainUID: $routeParams.domainUID,
                            computerUID: computer.uid
                        }).then(function (res) {
                            $scope.loadingComputers = true;
                            svc.GetComputers();
                            $scope.GetComputers().then(() => {
                                if (res.data) {
                                    let found = $scope.data.computers.find(x => x.uid === computer.uid)
                                    found.license = license = res.data[0];
                                    $scope.computerToManage = found;
                                }

                                $scope.serverLicense.isReloading = false;
                            });
                        });
                    } else {
                        $scope.loadingComputers = true;
                        svc.GetComputers();
                        $scope.GetComputers();
                    }


                } else {
                    $scope.serverLicense.isReloading = false;
                }

                $scope.serverLicense = res.data;
                ShowNotification("Done.", 3000, "is-success");

            } else {
                $scope.serverLicense.isReloading = false;
            }

        }, () => {
            $scope.serverLicense.isReloading = false;
        });
    }

    $scope.SetComputerLicense = function (computer) {
        computer.isLoading = true;
        PostApi(svc, $http, $q, "secure/set/computerLicense", {
            domainUID: $routeParams.domainUID,
            computerUID: computer.uid
        }).then(function (res) {
            if (res.data) {
                computer.license = res.data[0];
                $scope.GetServerLicense();
            } else {

            }

            computer.isLoading = false;
        }, () => {
            computer.isLoading = false;
        });
    }

    $scope.RemoveComputerLicense = function (computer) {
        computer.isLoading = true;
        PostApi(svc, $http, $q, "secure/delete/computerLicense", {
            domainUID: $routeParams.domainUID,
            computerUID: computer.uid
        }).then(function (res) {
            if (res.data) {
                computer.license = null;
                $scope.GetServerLicense();
            } else {

            }

            computer.isLoading = false;
        }, () => {
            computer.isLoading = false;
        });
    }

    $scope.ManageLicense = function (computer) {
        $scope.GetServerLicense();
        $scope.computerToManage = computer;
        OpenModal('ComputerLicenseModal');
    }

    $scope.ManageGlobalLicense = function () {
        $scope.GetServerLicense();
        OpenModal('LicenseModal');
    }

    GetSiteSetting("groupsAndComputers", svc, $q, $http).then(setting => {
        if (setting) {
            for (let prop in setting) {
                $scope.settings[prop] = setting[prop]
            }
        }

        $scope.loadingSettingsDone = true;
    });




    GetDomain($routeParams.domainUID, svc, $filter).then(domain => {
        if (domain) {
            $scope.domain = domain;
        }
    });

    $scope.CheckComputers = function () {
        var d = $q.defer();

        if (svc.data.computers) {
            svc.data.computers.then(res => {
                if (res.data.length != 0) {
                    d.resolve(true);
                } else {
                    d.resolve(false);
                }
            });
        } else {
            d.resolve(false);
        }

        return d.promise;
    }


    $scope.loadingComputers = true;
    svc.GetComputers();
    $scope.GetComputers = function () {

        var d = $q.defer();

        if (svc.data.computers) {
            svc.data.computers.then(res => {

                if (res.data.length > 0) {
                    $scope.data = res.data[0];

                    $scope.Reorder($scope.settings.computer.order, true, true);

                    $scope.loadingComputers = false;
                    d.resolve();
                } else {
                    $scope.data = [];
                    $scope.data.computers = [];
                    $scope.loadingComputers = false;
                    d.resolve();
                }

                $scope.loadingComputers = false;
                d.resolve();
            });
        } else {
            $scope.loadingComputers = false;
            d.resolve();
        }

        return d.promise;
    }

    $scope.CheckComputers().then(result => {
        if (!result) {
            OpenModal('DownloadModal')
        }
    })

    $scope.GetComputers();
    checkComputersInterval = setInterval(() => {
        $scope.CheckComputers().then((result) => {
            if (result) {
                clearInterval(checkComputersInterval);
                if (!$scope.data || !$scope.data.computers || $scope.data.computers.length === 0) {
                    $scope.GetComputers();
                }
            } else {
                svc.GetComputers();
                $scope.GetComputers();
            }
        })
    }, 3000)


    $scope.loadingGroups = true;
    svc.GetGroups();
    svc.data.groups.then(function (res) {
        res.data = $filter('orderBy')(res.data, 'group.name');
        $scope.groups = res.data;

        if (res.data.length > 0) {

        } else {}

        $scope.loadingGroups = false;
    }, () => {
        $scope.loadingGroups = false;
        //ShowNotification("Could not get groups.", 0, 'is-warning');
    });

    $scope.CreatePairingKey = () => {
        PostApi(svc, $http, $q, "secure/create/pairingKey", {
            domainUID: $routeParams.domainUID
        }).then(function (res) {

            console.log(res.data);

            if (res.data) {
                date = new Date(res.data[0].validUntil);
                ShowNotification("Key successfully created.<br/>Valid until " + date.toISOString().replace('T', ' ').slice(0, -8) + ".", 2000);
            } else {
                ShowNotification("Create key failed.", 2000);
            }
        });
    }

    $scope.DownloadMSI = (keyDate) => {

        var date = calendars.date.start
        date.setHours(23);
        date.setMinutes(59);

        $scope.loadingMsi = true;

        ShowNotification("Creating key <div class='spinner small'></div>", 5000);
        PostApi(svc, $http, $q, "secure/create/pairingKey", {
            domainUID: $routeParams.domainUID,
            validUntil: (new Date(date)).toISOString()
        }).then(function (keyRes) {

            ShowNotification("Creating key is done", 0);

            if (keyRes.data) {


                ShowNotification("Creating MSI", 0);

                PostApi(svc, $http, $q, "secure/msiPackage", {
                    domainUID: $routeParams.domainUID
                }).then(function (msiPackageRes) {

                    ShowNotification("Creating MSI is done.", 5000);
                    if (msiPackageRes.data) {
                        ShowNotification("Downloading MSI", 5000, "is-success");
                        var link = document.createElement("a");
                        link.id = "msiDownloadLnk";
                        link.href = appBaseUrl + msiPackageRes.data;
                        link.download = "Deployment_client.msi";
                        link.style.display = 'none';
                        link.text = "download";
                        document.body.appendChild(link);
                        document.getElementById("msiDownloadLnk").click();
                        document.body.appendChild(link).remove();
                        CloseModal('DownloadModal');
                    } else {
                        ShowNotification("Unknown error.");
                    }

                    $scope.loadingMsi = false;
                }, function (res) {
                    if (res.status == 410) {
                        ShowNotification("No key is created.");
                        $scope.loadingMsi = false;
                    }
                    if (res.status == 500) {
                        ShowNotification("Create MSI failed", 10000, 'is-danger');
                        $scope.loadingMsi = false;
                    }
                });

            } else {
                ShowNotification("Create key failed.");
            }
        });
    }

    $scope.SaveGroupName = function (groupItem) {

        let computerUIDs = groupItem.computers.map(c => c.uid);

        PostApi(svc, $http, $q, "secure/set/groupName", {
            groupUID: groupItem.group.uid,
            domainUID: $routeParams.domainUID,
            name: groupItem.group.name
        }).then(function (NewObject) {
            svc.data.groups.then((groupRes) => {
                groupRes.data = $filter('orderBy')(groupRes.data, ['group.name']);
                ShowNotification("Done.", 2000, "is-success");
            });
        }, (err) => {
            console.log(err)
        })
    }

    $scope.AddGroup = (newGroup) => {
        if ($scope.domain.permission && $scope.domain.permission >= 16 || !$scope.domain.permission) {

            $scope.isLoadingGroup = true;

            var currentComputerUIDs = [];
            var notInGroupComputerUIDs = [];

            if ($scope.data && $scope.data.computers && $scope.data.computers.length > 0) {

                for (let computer of $scope.data.computers) {
                    if (computer.selected) {
                        currentComputerUIDs.push(computer.uid);
                        computer.selected = false;
                    }
                };

                for (let computer of $scope.data.computers) {
                    if (!currentComputerUIDs.find(x => x == computer.uid)) {
                        notInGroupComputerUIDs.push(computer.uid);
                    }
                };



                if (!newGroup || !newGroup.name) {
                    ShowNotification("Type a name for the group");
                    $scope.isLoadingGroup = false;
                } else {
                    if (currentComputerUIDs.length > 0) {

                        var addedComputers = [];

                        svc.data.groups.then(function (groupRes) {

                            var setOrCreate = 'create';
                            if (newGroup.uid) {
                                setOrCreate = 'set'
                            } else {
                                newGroup.uid = '';
                            }

                            if (setOrCreate == "set") {
                                socket.emit('command', {
                                    computerUIDs: notInGroupComputerUIDs,
                                    groupUID: newGroup.uid,
                                    name: "send",
                                    queryName: "computerGroupPackages",
                                    eventString: "cancelPackageSchedule"
                                });
                            }


                            PostApi(svc, $http, $q, "secure/" + setOrCreate + "/computerGroup", {
                                groupUID: newGroup.uid,
                                computerUIDs: currentComputerUIDs,
                                groupName: newGroup.name,
                                groupCss: GetRandomColor(),
                                domainUID: $routeParams.domainUID
                            }).then(function (NewObject) {
                                if (newGroup.uid == '') {
                                    if (NewObject) {
                                        console.log("Pushing new group");
                                        groupRes.data.push(NewObject.data[0]);
                                        groupRes.data = $filter('orderBy')(groupRes.data, 'group.name');
                                        $scope.groups = groupRes.data

                                        CloseModal('AddGroupModal');
                                        newGroup.name = '';

                                        ShowNotification("Done.", 2000, 'is-success');
                                        $scope.isLoadingGroup = false;
                                    }
                                } else {
                                    if (NewObject) {

                                        var currentItems = $filter('filter')(groupRes.data, {
                                            group: {
                                                uid: newGroup.uid
                                            }
                                        }, true);

                                        var currentItem = currentItems[0];
                                        var newUIDs = currentItem.computers.map(computer => computer.uid);

                                        for (let uid of currentComputerUIDs) {
                                            if (newUIDs.indexOf(uid) > -1) {} else {
                                                addedComputers.push(uid);
                                            }
                                        }

                                        currentItem.computers = NewObject.data[0].computers;
                                        currentItem.group = NewObject.data[0].group;
                                        currentItem.group.selected = false;

                                        if (addedComputers.length > 0) {
                                            ShowNotification("Packages has been sent to new computers in this group.", 10000, 'is-success');
                                            console.log('Sending packages to computers');
                                            socket.emit('command', {
                                                computerUIDs: addedComputers,
                                                groupUID: currentItem.group.uid,
                                                name: "send",
                                                queryName: "computerGroupPackages",
                                                eventString: "packageChange"
                                            });
                                        } else {
                                            ShowNotification("Done.", 2000, 'is-success');
                                        }
                                    }
                                }

                                $scope.isLoadingGroup = false;
                            })


                        });
                    } else {
                        $scope.isLoadingGroup = false;
                        ShowNotification("Select at least one computer", 2000);
                    }
                }
            } else {
                $scope.isLoadingGroup = false;
                CloseModal('AddGroupModal');
                ShowNotification('Add a computer before adding a group', 0, "is-warning");
            }
        } else {
            $scope.isLoadingGroup = false;
            ShowNotification("You don't have permission to add groups.", 5000, "is-warning");
            CloseModal('AddGroupModal');
        }
    }


    $scope.ChangeComputerSelections = function (computers, selected) {

        if (computers) {
            for (let computer of $scope.data.computers) {
                computer.selected = false;
            }

            for (let computer of computers) {
                let scopeComputer = $scope.data.computers.find(arrComp => arrComp.uid === computer.uid);
                if (scopeComputer) {
                    scopeComputer.selected = selected;
                }
            }
        }
    }

    $scope.ChangeGroupSelections = function (items, selected) {

        for (let item of $scope.groups) {
            item.group.selected = false;
        }

        for (let item of items) {
            item.group.selected = selected;
        }
    }

    $scope.SaveGroup = function (groupItem) {

        let selectedComputer = $scope.data.computers.find(c => c.selected)

        if (selectedComputer) {
            $scope.groupToEdit = null;
            $scope.editGroup = false;
            CloseModal('EditGroupModal');
            $scope.AddGroup(groupItem.group);
        } else {
            ShowNotification("Select at least one computer.", 5000);
        }
    }

    $scope.EditGroupComputers = function (groupItem) {
        $scope.groupToEdit = groupItem;
        $scope.ChangeComputerSelections(groupItem.computers, true);
        OpenModal('EditGroupModal');
    }

    $scope.EditGroupName = function (groupItem, cancel) {

        if (!$scope.editMode || groupItem.group.selected && $scope.editMode) {
            $scope.editGroup = !$scope.editGroup;
            $scope.editMode = $scope.editGroup;
            groupItem.group.selected = $scope.editGroup;

            if (!$scope.editGroup && !cancel) {
                $scope.SaveGroupName(groupItem);
            }

            if (!groupItem.group.selected && cancel) {
                groupItem.group.name = groupItem.group.oldName;
            } else {
                groupItem.group.oldName = groupItem.group.name;
            }
        }
    }

    $scope.EditComputer = function (computer, cancel) {

        if (!$scope.editMode || computer.selected && $scope.editMode) {
            $scope.editComputer = !$scope.editComputer;
            $scope.editMode = $scope.editComputer;
            computer.selected = $scope.editComputer;
        }

        if (!$scope.editComputer) {
            computer.selected = false;
            $scope.order = 'friendlyName';
        } else {
            $scope.order = '';
        }

        if (!computer.selected && cancel) {
            computer.friendlyName = computer.oldName;
        } else {
            computer.oldName = computer.friendlyName;
        }
    }

    $scope.EditMode = function () {
        $scope.editMode = !$scope.editMode;

        if (!$scope.editMode) {
            $scope.editGroup = $scope.editMode;
            $scope.ChangeGroupSelections($scope.groups, false);
        }
    }

    $scope.SaveComputerName = function (computer) {
        PostApi(svc, $http, $q, "secure/set/computerFriendlyName", {
            uid: computer.uid,
            friendlyName: computer.friendlyName,
            domainUID: $routeParams.domainUID
        }).then(function (ReturnObject) {
            ShowNotification("Done.", 2000, "is-success")
            $scope.Reorder($scope.settings.computer.order, true, true);
        })

    }


    $scope.OpenModal = function (modalName) {
        OpenModal(modalName);
    }

    $scope.CloseModal = function (modalName) {
        CloseModal(modalName);
    }


    $scope.DeleteGroupConfirm = function (item) {
        if (domain.permission && domain.permission > 64 || !domain.permission) {
            $scope.groupToDelete = item;
            OpenModal('DeleteGroupModal');
        }
    }
    $scope.DeleteGroup = function () {
        $scope.groupToDelete.loading = true;
        var item = $scope.groupToDelete;
        let computerUIDs = item.computers.map(x => x.uid);

        socket.emit('command', {
            computerUIDs: computerUIDs,
            groupUID: item.group.uid,
            name: "send",
            queryName: "computerGroupPackages",
            eventString: "cancelPackageSchedule"
        });

        PostApi(svc, $http, $q, "secure/delete/group", {
            uid: item.group.uid,
            domainUID: $routeParams.domainUID
        }).then(function (ReturnObject) {
            $scope.groups.splice($scope.groups.indexOf(item), 1);
            $scope.groupToDelete.loading = false;
            CloseModal('DeleteGroupModal');
            ShowNotification("Done.", 2000, 'is-success');
        }, () => {
            ShowNotification("Could not remove group.", 2000, 'is-warning');
            $scope.groupToDelete.loading = false;
        })
    }


    $scope.DeleteComputerConfirm = function (computer) {
        if (domain.permission && domain.permission > 64 || !domain.permission) {
            $scope.computerToDelete = computer;
            OpenModal('DeleteComputerModal');
        }
    };

    $scope.DeleteComputer = function () {
        var computer = $scope.computerToDelete;

        computer.isLoading = true;

        socket.emit('command', {
            computerUID: computer.uid,
            name: "disconnect",
        });

        //ShowLoading();
        console.log("Deleting...");        
        PostApi(svc, $http, $q, "secure/delete/computer", {
            uid: computer.uid,
            domainUID: $routeParams.domainUID
        }).then(function (ReturnObject) {
            $scope.data.computers.splice($scope.data.computers.indexOf(computer), 1);
            console.log("Delete is done.");
            ShowNotification("Done.", 2000);
            CloseModal('DeleteComputerModal');            
        })
    }


    $scope.RequestWOLForGroup = function (groupItem) {
        var macAddresses = [];
        for (let computer of groupItem.computers) {
            if (computer.systemInfo && computer.systemInfo.macAddresses && computer.systemInfo.macAddresses.length != 0) {
                for (let address of computer.systemInfo.macAddresses) {
                    macAddresses.push(address);
                }
            }
        }

        if (macAddresses.length != 0) {
            ShowNotification("Command sent!", 4000);
            RequestWOL(macAddresses);
        } else {
            ShowNotification("0 MAC addresses was found.", 4000, "is-warning");
        }
    }

    $scope.RequestWOLForComputer = function (computer) {

        var macAddresses = [];
        if (computer.systemInfo && computer.systemInfo.macAddresses && computer.systemInfo.macAddresses.length != 0) {
            for (let address of computer.systemInfo.macAddresses) {
                macAddresses.push(address);
            }
        }

        if (macAddresses.length != 0) {
            ShowNotification("Command sent!", 4000);
            RequestWOL(macAddresses);
        } else {
            ShowNotification("0 MAC addresses was found.", 4000, "is-warning");
        }
    }

    $scope.isMouseDown = false;
    $scope.CheckMouse = function (down) {
        if (down) {
            $scope.isMouseDown = true;
        } else {
            $scope.isMouseDown = false;
        }
    }

    $scope.SelectComputerCheck = function (computer) {
        computer.selected = !computer.selected;
    }

    $scope.OpenModal = function (modalName) {
        OpenModal(modalName);
    }

    $scope.CloseModal = function (modalName) {
        CloseModal(modalName);
    }

    $scope.Reorder = function (array, ignoreReverse, skipSave) {
        if (array[0] == $scope.settings.computer.order[0] && !ignoreReverse) {
            $scope.settings.computer.reversed = !$scope.settings.computer.reversed;
        }

        $scope.settings.computer.order = array;
        $scope.data.computers = $filter('orderBy')($scope.data.computers, array, $scope.settings.computer.reversed);

        if (!skipSave) {
            $scope.SaveSettings($scope.settings);
        }
    }

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

    ChangeBackBtnUrl("/domains");


    $scope.$on('$viewContentLoaded', function (event) {});

    $scope.$on('$viewContentLoading', function (event) {});

    $scope.GetRandomColor = GetRandomColor();

    $scope.HideLoading = function () {
        HideLoading();
    };

    $scope.ShowLoading = function () {
        ShowLoading();
    };

    $rootScope.ShowBackBtn = true;
    $rootScope.ShowTitle = true;
    $rootScope.ShowSendBtn = false;
    $rootScope.ShowSearchBtn = false;

    Focus('search');

    $scope.$on('$destroy', function () {
        clearInterval(checkComputersInterval);
    });

    $scope.FocusForm = function (form, id) {
        FocusForm(form, id);
    };

    $scope.Goto = function (event) {
        event.preventDefault();
        Goto($location, event.currentTarget.pathname);
    };

}]);