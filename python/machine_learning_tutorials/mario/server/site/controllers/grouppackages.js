app.controller("GroupPackageController", [
  "$scope",
  "$routeParams",
  "$route",
  "$rootScope",
  "$location",
  "svc",
  "$filter",
  "$http",
  "$q",
  function(
    $scope,
    $routeParams,
    $route,
    $rootScope,
    $location,
    svc,
    $filter,
    $http,
    $q
  ) {
    $scope.listingAllAvailable = false;
    $scope.searchObj = {
      command: {}
    };
    svc.data.packages = null;
    svc.data.groupPackages = null;
    svc.data.mergedPackages.items = [];
    svc.data.scopePackages = [];
    $scope.items = svc.data.scopePackages;
    $scope.domain;
    svc.GetGroupPackages();

    svc.states.searchObj = $scope.searchObj;

    $scope.ComputerPackageStats = {};

    $scope.domainUID = $routeParams.domainUID;
    Focus("search");

    let startDate = flatpickr("#startDate", {
      onChange: function(selectedDates, dateStr, instance) {
        if (
          $scope.selectedItem &&
          $scope.selectedItem.schedule &&
          $scope.selectedItem.schedule.temp
        ) {
          $scope.selectedItem.schedule.temp.startDate = selectedDates[0];
        }
      }
    });

    let endDate = flatpickr("#endDate", {
      onChange: function(selectedDates, dateStr, instance) {
        if (
          $scope.selectedItem &&
          $scope.selectedItem.schedule &&
          $scope.selectedItem.schedule.temp
        ) {
          $scope.selectedItem.schedule.temp.endDate = selectedDates[0];
        }
      }
    });

    let startTime = flatpickr("#startTime", {
      enableTime: true,
      noCalendar: true,
      dateFormat: "H:i",
      defaultHour: 24,
      defaultDate: "18:00",
      onChange: function(selectedDates, dateStr, instance) {
        if (
          $scope.selectedItem &&
          $scope.selectedItem.schedule &&
          $scope.selectedItem.schedule.temp
        ) {
          $scope.selectedItem.schedule.temp.startTime = selectedDates[0];
        }
      }
    });

    let endTime = flatpickr("#endTime", {
      enableTime: true,
      noCalendar: true,
      dateFormat: "H:i",
      defaultHour: 24,
      defaultDate: "06:00",
      onChange: function(selectedDates, dateStr, instance) {
        if (
          $scope.selectedItem &&
          $scope.selectedItem.schedule &&
          $scope.selectedItem.schedule.temp
        ) {
          $scope.selectedItem.schedule.temp.endTime = selectedDates[0];
        }
      }
    });

    GetDomain($routeParams.domainUID, svc, $filter).then(domain => {
      $scope.domain = domain;
    });

    $scope.SaveSettings = function(obj) {
      SaveSiteSettings("groupPackages", obj, svc, $q, $http);
    };

    GetSiteSetting("groupPackages", svc, $q, $http).then(setting => {
      if (setting) {
        for (let prop in setting) {
          $scope.settings[prop] = setting[prop];
        }
      }

      $scope.loadingSettingsDone = true;
    });

    if (!$scope.settings) {
      $scope.settings = {
        groupPackages: null
      };
    }

    if (!$scope.settings.groupPackages) {
      $scope.settings.groupPackages = {};
      $scope.settings.groupPackages.order = ["chocoPackage.Title"];
      $scope.settings.groupPackages.reversed = false;
      $scope.settings.groupPackages.view = 1;
    }

    $scope.$watch(
      () => {
        return svc.data.scopePackages.length;
      },
      (newLength, oldLength) => {
        if (newLength !== oldLength) {
          $scope.items = svc.data.scopePackages;
        }
      }
    );

    $scope.OpenInfoModal = function(item) {
      $scope.selectedPackageItem = item;
      document.getElementById(
        "PackageModalDesc"
      ).innerHTML = converter.makeHtml(item.chocoPackage.Description);
      OpenModal("PackageModal");
    };

    $scope.Reorder = function(array, ignoreReverse, skipSave) {
      if (
        array[0] == $scope.settings.groupPackages.order[0] &&
        !ignoreReverse
      ) {
        $scope.settings.groupPackages.reversed = !$scope.settings.groupPackages
          .reversed;
      }

      $scope.settings.groupPackages.order = array;

      svc.data.scopePackages = $filter("orderBy")(
        svc.data.scopePackages,
        array,
        $scope.settings.groupPackages.reversed
      );
      $scope.items = svc.data.scopePackages;

      if (!skipSave) {
        $scope.SaveSettings($scope.settings);
      }
    };

    $scope.SetSearchObj = function(name, status, oldVersion, listAllAvailable) {
      SetSearchObj($scope, svc, name, status, oldVersion, listAllAvailable);
    };

    $scope.GetPackages = function(allAvailable) {
      $scope.LoadingDone(false);

      if (allAvailable) {
        $scope.searchObj = null;
        svc.states.searchObj = $scope.searchObj;
        console.log("searching");
        LoadChocoPackages(
          $http,
          svc,
          $filter,
          $routeParams,
          $q,
          "",
          true,
          true,
          $scope.searchObj
        ).then(() => {
          $scope.Reorder($scope.settings.groupPackages.order, true, true);
          $scope.LoadingDone(true);
          $scope.GetAllStats($scope.items);
        });
        $scope.listingAllAvailable = true;
        svc.states.listingAllAvailable = $scope.listingAllAvailable;
      } else {
        if ($scope.listingAllAvailable) {
          console.log("resetting after listingAllAvaliable");

          svc.data.mergedPackages.items = [];
          svc.data.scopePackages = [];

          svc.GetGroupPackages();
          svc.data.groupPackages.then(groupPackagesRes => {
            svc.data.mergedPackages.items = [];
            svc.data.scopePackages = [];

            if (groupPackagesRes.data[0].length != 0) {
              GetAllPackages(
                groupPackagesRes.data[0],
                svc,
                $http,
                $filter,
                $routeParams,
                $q,
                true,
                true,
                false,
                true
              ).then(() => {
                $scope.Reorder($scope.settings.groupPackages.order, true, true);
                $scope.LoadingDone(true);
                $scope.GetAllStats(groupPackagesRes.data[0]);
              });
            } else {
              $scope.LoadingDone(true);
              $scope.items = [];
            }
          });
        } else {
          $scope.LoadingDone(false);
          console.log("filtering");
          svc.data.scopePackages = [];
          svc.data.scopePackages = $filter("filter")(
            svc.data.mergedPackages.items,
            $scope.searchObj,
            true
          );
          $scope.Reorder($scope.settings.groupPackages.order, true, true);
          $scope.LoadingDone(true);
        }

        $scope.listingAllAvailable = false;
        svc.states.listingAllAvailable = $scope.listingAllAvailable;
      }
    };

    PrepAndConnectSocket(
      svc,
      $filter,
      $routeParams,
      $http,
      $q,
      $rootScope,
      false
    );

    $rootScope.Reconnect = () => {
      PrepAndConnectSocket(
        svc,
        $filter,
        $routeParams,
        $http,
        $q,
        $rootScope,
        false
      );
    };

    $scope.LoadingDone = function(done) {
      $scope.loadingDone = done;
      Focus("search");
    };

    GetGroupItem($routeParams.groupUID, svc, $filter, currentGroupItem => {
      if (currentGroupItem) {
        $scope.groupItem = currentGroupItem;
        $scope.computers = $scope.groupItem.computers;
        $scope.computerUIDs = $scope.groupItem.computers.map(
          computer => computer.uid
        );
      }
    });

    svc.data.groupPackages.then(groupPackagesRes => {
      GetAllPackages(
        groupPackagesRes.data[0],
        svc,
        $http,
        $filter,
        $routeParams,
        $q,
        true,
        true,
        false,
        true
      ).then(() => {
        $scope.Reorder($scope.settings.groupPackages.order, true, true);
        $scope.LoadingDone(true);
        $scope.GetAllStats(groupPackagesRes.data[0]);
      });
    });

    $scope.Search = function(value) {
      $scope.LoadingDone(false);

      if ($scope.listingAllAvailable) {
        value = value.toLowerCase();

        var encoded;

        if (value || value != "") {
          value = encodeURIComponent(value);
          encoded = `Search()?$filter=IsAbsoluteLatestVersion&searchTerm=%27${value}%27&targetFramework=''&includePrerelease=${!!$scope
            .settings.groupPackages
            .includePrerelease}&$skip=0&$top=15&semVerLevel=2.0.0`;
          LoadChocoPackages(
            $http,
            svc,
            $filter,
            $routeParams,
            $q,
            encoded,
            true,
            true
          ).then(() => {
            $scope.Reorder($scope.settings.groupPackages.order, true, true);
            $scope.LoadingDone(true);
            $scope.GetAllStats($scope.items);
          });
        } else {
          LoadChocoPackages(
            $http,
            svc,
            $filter,
            $routeParams,
            $q,
            "",
            true,
            true
          ).then(() => {
            $scope.Reorder($scope.settings.groupPackages.order, true, true);
            $scope.LoadingDone(true);
            $scope.GetAllStats($scope.items);
          });
        }
      } else {
        $scope.LoadingDone(true);
      }
    };

    $scope.UpdateCurrentPackageStats = function(item) {
      if (!item.expandedView && !item.temp && item.temp != {}) {
        $scope.GetComputerStats(item);
      }

      item.expandedView = !item.expandedView;
    };

    $scope.GetComputerStats = function(item) {
      GetFullComputerStats(
        item,
        $scope,
        $scope.computerUIDs,
        svc,
        $filter,
        $http,
        $q,
        $routeParams
      );
    };

    $scope.DeletePackage = function(
      item,
      notify,
      skipItemUpdate,
      skipLockEmit
    ) {
      item.isLoading = true;

      var packageHash = "";
      var packageName = "";
      var packageVersion = "";

      if (
        item.package &&
        item.version &&
        item.version.packageHash &&
        item.package.name
      ) {
        packageHash = item.version.packageHash;
        packageName = item.package.name;
        packageVersion = item.version.version;
      } else {
        packageHash = item.chocoPackage.PackageHash;
        packageName = item.chocoPackage.Id;
        packageVersion = item.chocoPackage.Version;
      }

      $scope.selectedItem = null;

      PostApi(svc, $http, $q, "secure/delete/groupPackage", {
        groupUID: $routeParams.groupUID,
        packageHash: packageHash,
        domainUID: $routeParams.domainUID
      }).then(
        result => {
          if (result) {
            let toSend = JSON.parse(JSON.stringify(item));

            toSend.version = {};

            toSend.package.name = packageName;
            toSend.version.packageHash = packageHash;
            toSend.version.version = packageVersion;
            delete toSend.chocoPackage;
            delete toSend.schedule.temp;
            delete toSend.temp;

            var data = {
              computerUIDs: $scope.computerUIDs,
              packages: [toSend]
            };

            socket.emit("cancelPackageSchedule", data);

            if (!skipItemUpdate) {
              item.command = {};
              item.version = {};
              item.package = {};
              item.schedule = {};
              item.temp = null;
              item.commandName = null;
              item.isAutoUpdate = null;

              GetGroupComputersUIDs(
                $routeParams.groupUID,
                svc,
                $filter,
                computerUIDs => {
                  GetFullComputerStats(
                    item,
                    $scope,
                    computerUIDs,
                    svc,
                    $filter,
                    $http,
                    $q,
                    $routeParams,
                    true,
                    true
                  );
                }
              );

              if (item.otherVersions && item.otherVersions.length != 0) {
                var filtered = item.otherVersions.filter(
                  x =>
                    x.chocoPackage.PackageHash === item.chocoPackage.PackageHash
                );
                if (filtered && filtered.length != 0) {
                  filtered[0].command = {};
                  filtered[0].version = {};
                  filtered[0].package = {};
                  filtered[0].schedule = {};
                }
              }
            }

            if (notify) {
              item.isLoading = false;
              ShowNotification(
                packageName +
                  " (" +
                  item.chocoPackage.Version +
                  ") was removed",
                3000
              );
            }
          }

          HideLoading();
        },
        err => {
          ShowNotification("error: " + err, 3000);
        }
      );
    };

    async function GetExistingGroupPackages(item) {
      let result = await svc.data.groupPackages;
      let filteredById = result.data[0].filter(
        x => x && x.package && x.package.name === item.chocoPackage.Id
      );

      const matchingChocoPackages = await GetMatchingChocoPackages(
        filteredById,
        svc,
        $http,
        $routeParams,
        $q,
        true,
        false
      );

      let i = matchingChocoPackages.length;
      while (i--) {
        const chocoItem = matchingChocoPackages[i];

        const remoteItem = filteredById.find(
          x => x.version.version == chocoItem.chocoPackage.Version
        );
        if (remoteItem && chocoItem) {
          chocoItem.package = remoteItem.package;
          chocoItem.version = remoteItem.version;
          chocoItem.command = remoteItem.command;
          chocoItem.schedule = FixSchedule(remoteItem.schedule);
        }
      }

      return matchingChocoPackages;
    }

    $scope.GetAllVersions = async function(item) {
      if (!item.otherVersions) {
        item.otherVersions = [];
      }

      item.otherVersions.loading = true;

      let encoded;

      if (item || item != "") {
        encoded =
          "Packages?$filter=Id%20eq%20%27" +
          item.chocoPackage.Id +
          "%27&$orderby=Published%20desc&$top=10&$skip=" +
          item.otherVersions.length;
      }

      if (item.otherVersions.length == 0) {
        const existingPackages = await GetExistingGroupPackages(item);
        item.otherVersions = item.otherVersions.concat(existingPackages);
      }

      const chocoResult = await PostApi(
        svc,
        $http,
        $q,
        "secure/choco/packages",
        {
          query: encoded,
          source: item.source
        }
      );

      if (
        chocoResult &&
        chocoResult.data &&
        chocoResult.data.packages &&
        chocoResult.data.packages.length != 0
      ) {
        const chocoPackages = chocoResult.data.packages;
        const toAdd = [];

        for (const chocoItem of chocoPackages) {
          const existingPackage = item.otherVersions.find(
            x => x.chocoPackage.Version == chocoItem.chocoPackage.Version
          );
          if (!existingPackage) {
            toAdd.push(chocoItem);
          }
        }

        item.otherVersions = item.otherVersions.concat(toAdd);
        item.otherVersions = OrderByVersion(item.otherVersions);
        $scope.$digest();
        item.otherVersions.loading = false;
      } else {
        item.otherVersions.loading = false;
      }
    };

    $scope.AddCommand = function(item, command) {
      command = command + "|";
      var index = -1;

      if (item.command.parameters && item.command.parameters != "") {
        index = item.command.parameters.indexOf(command);
      }

      if (index == -1) {
        if (item.command.parameters) {
          item.command.parameters += command;
        } else {
          item.command.parameters = command;
        }
      } else {
        item.command.parameters = item.command.parameters.replace(command, "");
      }
    };

    $scope.ToggleTempParam = function(item, type, param) {
      param = param + "|";
      var index = -1;

      console.log(item[type]);
      if (item[type].temp && item[type].temp != "") {
        index = item[type].temp.indexOf(param);
      }

      if (index == -1) {
        if (item[type].temp) {
          item[type].temp += param;
        } else {
          item[type].temp = param;
        }
      } else {
        item[type].temp = item[type].temp.replace(param, "");
      }
    };

    $scope.AddTempParam = function(item, param) {
      param = param + "|";
      var index = -1;

      if (item.command.tempparameters && item.command.tempparameters != "") {
        index = item.command.tempparameters.indexOf(param);
      }

      if (index == -1) {
        if (item.command.tempparameters) {
          item.command.tempparameters += param;
        } else {
          item.command.tempparameters = param;
        }
      } else {
        item.command.tempparameters = item.command.tempparameters.replace(
          param,
          ""
        );
      }
    };

    $scope.AddParam = function(str, param) {
      return AddRemoveParam(str, param);
    };

    $scope.DoesParamExist = function(params, param) {
      return DoesParamExist(params, param);
    };

    $scope.GetPackage = function(item, otherVersionItem, updateStats) {
      item.changingVersion = true;

      let packageHash = "";
      if (
        otherVersionItem.chocoPackage &&
        otherVersionItem.chocoPackage.PackageHash
      ) {
        packageHash = otherVersionItem.chocoPackage.PackageHash;
      } else if (otherVersionItem.version && otherVersionItem.version.version) {
        packageHash = otherVersionItem.version.version;
      }

      PostApi(svc, $http, $q, "secure/get/groupPackage", {
        packageHash: packageHash,
        groupUID: $routeParams.groupUID,
        domainUID: $routeParams.domainUID
      }).then(result => {
        if (result && result.data[0].length > 0) {
          const newPackage = result.data[0][0];

          otherVersionItem.version = newPackage.version;
          otherVersionItem.package = newPackage.package;
          otherVersionItem.command = newPackage.command;
          otherVersionItem.schedule = FixSchedule(newPackage.schedule);
        }

        if (updateStats) {
          item.version = otherVersionItem.version;
          item.package = otherVersionItem.package;
          item.command = otherVersionItem.command;
          item.schedule = FixSchedule(otherVersionItem.schedule);
          item.chocoPackage = otherVersionItem.chocoPackage;
        }

        const autoUpgradePackage = item.otherVersions.find(
          x => x.schedule.type == 1 && x.command.name == "upgrade"
        );

        if (autoUpgradePackage) {
          if (
            item.chocoPackage.Version != autoUpgradePackage.chocoPackage.Version
          ) {
            item.controlledByAutoUpdate = true;
          } else {
            item.controlledByAutoUpdate = false;
          }

          item.command = autoUpgradePackage.command;
          item.package = autoUpgradePackage.package;
        }

        if (updateStats) {
          $scope.GetComputerStats(item);
        } else {
        }

        item.changingVersion = false;
      });
    };

    $scope.CheckOtherVersions = function(item) {
      if (
        item.otherVersions &&
        item.otherVersions.find(
          x =>
            x.command &&
            x.version &&
            x.command.name &&
            x.version.version &&
            x.chocoPackage.Version != item.chocoPackage.Version
        )
      ) {
        ShowNotification(
          "One or more versions of this group package already exists. Delete the other packages before adding an auto upgrade package.",
          0,
          "is-info"
        );
      } else if (item.schedule.type == 1) {
        ShowNotification(
          "This package is an auto upgrade package. Delete this package to change this package to a non auto upgrading package.",
          0,
          "is-info"
        );
      } else {
        item.schedule.temp.type == 1
          ? (item.schedule.temp.type = 0)
          : (item.schedule.temp.type = 1);
      }
    };

    $scope.GetAllStats = function(items) {
      return new Promise(resolve => {
        GetGroupComputersUIDs(
          $routeParams.groupUID,
          svc,
          $filter,
          computerUIDs => {
            if (computerUIDs) {
              let i = items.length;
              while (i--) {
                const item = items[i];
                GetFullComputerStats(
                  item,
                  $scope,
                  computerUIDs,
                  svc,
                  $filter,
                  $http,
                  $q,
                  $routeParams,
                  true
                );
              }
            }
          }
        );

        resolve();
      });
    };

    $scope.ChangePackage = function(item, type) {
      if (socket.connected) {
        let force = DoesParamExist(item.command.tempparams, "-f");

        if (item.command.tempparameters && item.command.tempparameters != "") {
          item.command.parameters = item.command.tempparameters;
        } else {
          item.command.parameters = "";
        }

        item.command.execAsUser = item.command.tempExecAsUser;

        if (item.schedule && item.schedule.temp && !item.schedule.temp.active) {
          item.schedule.temp = {};
        }

        item.schedule = JSON.parse(JSON.stringify(item.schedule.temp));

        var chocoPackage = item.chocoPackage;
        var package = {
          name: item.chocoPackage.Id
        };
        var version = {
          packageHash: item.chocoPackage.PackageHash,
          version: item.chocoPackage.Version
        };

        var source = item.source;

        item.command.status = "pending";
        item.command.name = type;
        item.version = version;

        item.command.added = new Date().toISOString();

        if (item.schedule.startDate && item.schedule.startDate != "") {
          var myDate = new Date(item.schedule.startDate);
          myDate.setUTCHours(0, 0, 0, 0);
          myDate = new Date(myDate.toISOString());
          var date = new Date(myDate.setDate(myDate.getDate()));

          item.schedule.startDate = date;
        } else {
          item.schedule.startDate = null;
        }

        if (item.schedule.endDate && item.schedule.endDate != "") {
          var myDate = new Date(item.schedule.endDate);
          myDate.setUTCHours(0, 0, 0, 0);
          myDate = new Date(myDate.toISOString());
          var date = new Date(myDate.setDate(myDate.getDate()));

          item.schedule.endDate = date;
        } else {
          item.schedule.endDate = null;
        }

        if (item.schedule.startTime && item.schedule.startTime != "") {
          var myDate = new Date(item.schedule.startTime);
          date = new Date();
          date = new Date(date.setHours(myDate.getHours()));
          date = new Date(date.setMinutes(myDate.getMinutes()));
          date = new Date(date.setSeconds(00));
          date = new Date(date.setMilliseconds(00));
          date = new Date(date.toUTCString());

          item.schedule.startTime = date;
        } else {
          item.schedule.startTime = null;
        }

        if (item.schedule.endTime && item.schedule.endTime != "") {
          var myDate = new Date(item.schedule.endTime);
          date = new Date();
          date = new Date(date.setHours(myDate.getHours()));
          date = new Date(date.setMinutes(myDate.getMinutes()));
          date = new Date(date.setSeconds(00));
          date = new Date(date.setMilliseconds(00));
          date = new Date(date.toUTCString());

          item.schedule.endTime = date;
        } else {
          item.schedule.endTime = null;
        }

        var newItem = {
          version: version,
          package: package,
          command: item.command,
          schedule: item.schedule,
          source: source
        };
        var data = {
          groupUID: $routeParams.groupUID,
          computerUIDs: $scope.computerUIDs,
          packages: [newItem]
        };

        if (force) {
          data.groupUID = null;
        }

        socket.emit("packageChange", data);

        ShowNotification("Done!", 2000, "is-success");

        HideLoading();

        item.oldVersion = false;

        var filtered = [];
        if (item.otherVersions && item.otherVersions.length != 0) {
          var filtered = $filter("filter")(
            item.otherVersions,
            {
              chocoPackage: {
                PackageHash: newItem.version.packageHash
              }
            },
            true
          );
        }

        if (filtered && filtered.length != 0) {
          var otherVersionItem = filtered[0];
          otherVersionItem.version = newItem.version;
          otherVersionItem.package = newItem.package;
          otherVersionItem.command = newItem.command;
          otherVersionItem.schedule = FixSchedule(newItem.schedule);
          otherVersionItem.oldVersion = false;
          //console.log("Updating otherVersionItem");
        } else {
          //console.log("could not find other version item")
        }

        GetGroupComputersUIDs(
          $routeParams.groupUID,
          svc,
          $filter,
          computerUIDs => {
            console.log("getting stats in package change");
            GetFullComputerStats(
              item,
              $scope,
              computerUIDs,
              svc,
              $filter,
              $http,
              $q,
              $routeParams,
              true,
              true
            );
          }
        );
      } else {
        ShowNotification(
          "No server connection, no changes was made.",
          0,
          "is-warning"
        );
      }
    };

    $scope.ShowVersionDd = ShowVersionDd;

    $scope.OpenModal = function(modalName) {
      OpenModal(modalName);
    };

    $scope.CloseModal = function(modalName) {
      CloseModal(modalName);
    };

    $scope.OpenInfoModal = function(item) {
      $scope.selectedPackageItem = item;
      document.getElementById(
        "PackageModalDesc"
      ).innerHTML = converter.makeHtml(item.chocoPackage.Description);
      OpenModal("PackageModal");
    };

    $scope.ShowConfirm = function(item) {
      OpenModal("ConfirmModal");

      item.command.tempparameters = item.command.parameters;
      item.schedule.temp = JSON.parse(JSON.stringify(item.schedule));
      item.schedule.temp = FixSchedule(item.schedule.temp);

      item.command.tempExecAsUser = item.command.execAsUser;

      if (ValidateDate(item.schedule.temp.startDate)) {
        startDate.setDate(item.schedule.temp.startDate);
      } else {
        startDate.setDate(new Date());
        item.schedule.temp.startDate = startDate.selectedDates[0];
      }

      if (ValidateDate(item.schedule.temp.endDate)) {
        endDate.setDate(item.schedule.temp.endDate);
      } else {
        let end = new Date();
        endDate.setDate(end.setDate(end.getDate() + 4));
        item.schedule.temp.endDate = endDate.selectedDates[0];
      }

      if (ValidateDate(item.schedule.temp.startTime)) {
        startTime.setDate(item.schedule.temp.startTime);
      } else {
        let startT = new Date();
        startT.setHours(18);
        startT.setMinutes(00);
        startTime.setDate(startT);
        item.schedule.temp.startTime = startTime.selectedDates[0];
      }

      if (ValidateDate(item.schedule.temp.endTime)) {
        endTime.setDate(item.schedule.temp.endTime);
      } else {
        let endT = new Date();
        endT.setHours(06);
        endT.setMinutes(00);
        endTime.setDate(endT);
        item.schedule.temp.endTime = endTime.selectedDates[0];
      }

      if (ValidateExactSchedule(item.schedule.temp)) {
        item.schedule.temp.active = true;
      }

      $scope.selectedItem = item;

      if (item && item.otherVersions) {
        const newestPackage = GetNewestPackage(
          item.otherVersions,
          item,
          $filter,
          true
        );

        if (newestPackage) {
          const versionResult = CompareVersions(
            item.chocoPackage.Version,
            newestPackage.chocoPackage.Version
          );

          if (versionResult < 1) {            
            $scope.selectedItem.temp.oldVersion = true;
          }
        }
      }
    };

    $scope.ShowComputersModal = function(header, computers) {
      if (!$scope.info) {
        $scope.info = {};
      }

      $scope.info.header = header;
      $scope.info.computers = computers;
      $("#ComputersModal").openModal();
    };

    $scope.ShowComputersPackageStatsModal = function(item, view) {
      $scope.computersPackageStats = {
        item: item
      };

      $scope.SetViewProp(item, view);

      OpenModal("ComputersPackageStatsModal");
    };

    $scope.SetViewProp = (item, view) => {
      let prop = "";

      switch (view) {
        case 1:
          if (
            item.command &&
            item.command.name &&
            item.command.name !== "uninstall"
          ) {
            prop = "installedComputers";
            $scope.computersPackageStats.view = 3;
          } else if (
            item.command &&
            item.command.name &&
            item.command.name === "uninstall"
          ) {
            prop = "uninstalledComputers";
            $scope.computersPackageStats.view = 4;
          } else {
            prop = "installedComputers";
            $scope.computersPackageStats.view = 3;
          }
          break;
        case 2:
          prop = "workingComputers";
          break;
        case 3:
          prop = "installedComputers";
          break;
        case 4:
          prop = "uninstalledComputers";
          break;
        case 5:
          prop = "failedComputers";
          break;
        case 6:
          prop = "noStatusComputers";
          break;
      }

      $scope.computersPackageStats.prop = prop;

      if (view != 1) {
        $scope.computersPackageStats.view = view;
      }
    };

    $scope.DetachGroupComputerConfirm = function(computer) {
      $scope.computerToDetach = computer;
      $("#DetachGroupComputerModal").openModal();
    };
    $scope.DetachGroupComputer = function() {
      var computer = $scope.computerToDetach;

      console.log("Deleting...");
      $scope.computers.splice($scope.computers.indexOf(computer), 1);
      PostApi(svc, $http, $q, "secure/delete/groupComputer", {
        computerUID: computer.uid,
        groupUID: $routeParams.groupUID,
        domainUID: $routeParams.domainUID
      }).then(function(ReturnObject) {
        console.log("Delete is done.");
        var computerName = "";

        if (computer.friendlyName && computer.friendlyName.length > 0) {
          computerName = computer.friendlyName;
        } else {
          computerName = computer.name;
        }

        //Delete packages attached to deleted computer
        svc.data.groupPackages.then(function(groupPackagesRes) {
          toKeep = $filter("filter")(
            groupPackagesRes.data[0].groupPackages,
            {
              computer: {
                uid: "!" + computer.uid
              }
            },
            true
          );
          groupPackagesRes.data[0].groupPackages = toKeep;
        });

        //Recount packages

        LoadChocoPackages(
          $http,
          svc,
          $filter,
          $routeParams,
          $q,
          "",
          true,
          true
        );
        //GetGroupPackageInfo(chocoRes.data.packages, svc, $filter, $routeParams);
        HideLoading();

        ShowNotification(computerName + " has been detached", 2000);
        HideLoading();
      });
    };

    $scope.ValidateExactDate = function(schedule) {
      return ValidateExactSchedule(schedule);
    };

    $scope.ValidateDate = function(date) {
      return ValidateDate(date);
    };

    $scope.ValidateSchedule = function(item) {
      return ValidateSchedule(item);
    };

    $scope.NavigateToComputer = function(computerUID) {
      Goto(
        $location,
        "domains/" +
          $routeParams.domainUID +
          "/computers/" +
          computerUID +
          "/packages"
      );
      HideLoading();
    };

    $scope.NavigateTocomputer = function(computer) {
      Goto(
        $location,
        "domains/" +
          $routeParams.domainUID +
          "/computers/" +
          computer.UID +
          "/packages"
      );
      HideLoading();
    };

    ChangeBackBtnUrl("domains/" + $routeParams.domainUID + "/computers");

    $scope.UpdatePackageInfo = function(packageChange) {
      UpdatePackageInfo(packageChange);
    };
    $scope.HideLoading = function() {
      HideLoading();
    };

    $scope.ShowLoading = function() {
      ShowLoading();
    };

    $scope.IsoToDate = function(date) {
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
    };

    Focus("search");

    $scope.FocusForm = function(form, id) {
      FocusForm(form, id);
    };

    $rootScope.ShowBackBtn = true;
    $rootScope.ShowTitle = true;
    $rootScope.ShowSendBtn = false;
    $rootScope.ShowSearchBtn = false;

    $scope.$on("$destroy", function() {
      svc.data.groupPackages = null;
      svc.data.mergedPackages.items = [];
      svc.data.scopePackages = [];
    });

    $scope.Goto = function(event) {
      event.preventDefault();
      Goto($location, event.currentTarget.pathname);
    };
  }
]);
