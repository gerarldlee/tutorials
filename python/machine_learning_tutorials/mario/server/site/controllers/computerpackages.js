app.controller("ComputerPackageController", [
  "$scope",
  "$routeParams",
  "$route",
  "$rootScope",
  "$location",
  "svc",
  "$filter",
  "$http",
  "$timeout",
  "$q",
  function (
    $scope,
    $routeParams,
    $route,
    $rootScope,
    $location,
    svc,
    $filter,
    $http,
    $timeout,
    $q
  ) {
    svc.states.updatePackages = false;
    $scope.listingAllAvailable = false;
    $scope.searchObj = null;
    svc.data.packages = null;
    svc.data.scopePackages = [];
    svc.data.mergedPackages.items = [];
    $scope.items = svc.data.scopePackages;
    $scope.domain;
    $scope.initDpLogModal = false;
    svc.GetLatestComputerPackages();
    let socketInterval;

    var obj = {};
    obj.command = {
      name: "!uninstall",
    };

    $scope.searchObj = obj;
    svc.states.searchObj = obj;

    GetSiteSetting("computerPackages", svc, $q, $http).then((setting) => {
      if (setting) {
        for (let prop in setting) {
          $scope.settings[prop] = setting[prop];
        }
      }
    });

    GetDomain($routeParams.domainUID, svc, $filter).then((domain) => {
      $scope.domain = domain;

      if ($scope.domain.permission && $scope.domain.permission < 8) {
        ShowNotification("Only read permissions.", "stay on");
      }
    });

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

    if (!svc.data.computers) {
      svc.GetComputers();
    }

    if (svc.data.computers) {
      svc.data.computers.then((res) => {
        if (res.data.length > 0) {
          var computers = res.data[0].computers.filter(
            (x) => x.uid === $routeParams.computerUID
          );
          if (computers.length > 0) {
            $scope.computer = computers[0];
            var computer = computers[0];

            if ($scope.computer.inventorying) {
              ShowNotification(
                "Please wait while Deployment client is getting ready",
                5000,
                "blue"
              );
            }

            // if (computer.systemInfo && computer.systemInfo.freeSystemDiskSpace && computer.systemInfo.freeSystemDiskSpace < 0.5) {
            //     computer.systemInfo.css = "red";
            // } else if (computer.systemInfo && computer.systemInfo.freeSystemDiskSpace && computer.systemInfo.freeSystemDiskSpace < 5) {
            //     computer.systemInfo.css = "orange";
            // } else if (computer.systemInfo) {
            //     computer.systemInfo.css = "";
            // }
          }
        }
      });
    } else {
      console.log("No computers");
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

    $scope.Download = function (text) {
      DownloadText(text);
    };

    $scope.GetDpLog = function () {
      if ($scope.computer.online) {
        $scope.waitingForLog = true;
        var currentLogTime = $scope.computer.systemInfo.dpLogSent;

        socketInterval = setInterval(() => {
          if (
            currentLogTime != $scope.computer.systemInfo.dpLogSent ||
            !socket.connected
          ) {
            if (!socket.connected) {
              ShowNotification(
                "Socket disconnected, try again when connected.",
                5000,
                "is-warning"
              );
            }

            clearInterval(socketInterval);
            $scope.waitingForLog = false;
            // $scope.$evalAsync();
            $scope.GetComputerLog();
          }
        }, 1000);

        RequestDpLog([$routeParams.computerUID]);
      } else {
        ShowNotification(
          "The computer has to be online to refresh the log.",
          5000
        );
      }
    };
    //console.log("set data triggerd");

    $scope.OpenExecLog = function (item) {
      $scope.currentExecLog = item.command.execLog;
      $scope.OpenModal("execLogModal");
    };

    $scope.OpenModal = function (modalName) {
      OpenModal(modalName);
    };

    $scope.CloseModal = function (modalName) {
      CloseModal(modalName);
    };

    $scope.ShowLog = function (item) {
      $scope.logItem = item;
      $scope.OpenModal("LogModal");
    };

    $scope.SetSearchObj = function (
      name,
      status,
      oldVersion,
      listAllAvailable
    ) {
      SetSearchObj($scope, svc, name, status, oldVersion, listAllAvailable);
    };

    $scope.LoadingDone = function (done) {
      $scope.loadingDone = done;
      Focus("search");
    };

    $scope.Search = function (value) {
      if ($scope.listingAllAvailable) {
        $scope.LoadingDone(false);

        value = value.toLowerCase();

        var encoded;

        if (value || value != "") {
          value = encodeURIComponent(value);

          encoded = `Search()?$filter=IsAbsoluteLatestVersion&searchTerm=%27${value}%27&targetFramework=''&includePrerelease=${!!$scope
            .settings.computerPackages
            .includePrerelease}&$skip=0&$top=15&semVerLevel=2.0.0`;
          LoadChocoPackages(
            $http,
            svc,
            $filter,
            $routeParams,
            $q,
            encoded,
            true,
            false
          ).then(() => {
            $scope.Reorder($scope.settings.computerPackages.order, true, true);
            $scope.LoadingDone(true);
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
            false
          ).then(() => {
            $scope.Reorder($scope.settings.computerPackages.order, true, true);
            $scope.LoadingDone(true);
          });
        }
      } else {
        $scope.LoadingDone(true);
      }
    };

    $scope.GetPackage = function (item, otherVersionItem) {
      item.changingVersion = true;

      if (item.otherVersions) {
        const existingPackage = item.otherVersions.find(
          (x) => x.chocoPackage.Version == item.chocoPackage.Version
        );

        if (existingPackage) {
          existingPackage.version = item.version;
          existingPackage.package = item.package;
          existingPackage.command = item.command;
          existingPackage.chocoPackage = item.chocoPackage;
          existingPackage.groupInfo = item.groupInfo;
          existingPackage.upgradable = item.upgradable;
        }
      }

      item.version = otherVersionItem.version;
      item.package = otherVersionItem.package;
      item.command = otherVersionItem.command;
      item.chocoPackage = otherVersionItem.chocoPackage;
      item.groupInfo = otherVersionItem.groupInfo;

      item.upgradable = false;

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

        if (versionResult > 0) {
          item.upgradable = true;
        }
      }

      item.changingVersion = false;
    };

    async function GetExistingPackages(item) {
      const serverResult = await PostApi(
        svc,
        $http,
        $q,
        "secure/get/computerPackageAllVersions",
        {
          computerUIDs: [$routeParams.computerUID],
          domainUID: $routeParams.domainUID,
          packageName: item.chocoPackage.Id,
        }
      );

      const existingRemotePackages = serverResult.data[0].packages;

      const matchingChocoPackages = await GetMatchingChocoPackages(
        existingRemotePackages,
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
        chocoItem.visible = false;

        const remoteItem = existingRemotePackages.find(
          (x) => x.version.version == chocoItem.chocoPackage.Version
        );
        if (remoteItem && chocoItem) {
          chocoItem.package = remoteItem.package;
          chocoItem.version = remoteItem.version;
          chocoItem.command = remoteItem.command;
          chocoItem.groupInfo = remoteItem.groupInfo;
          chocoItem.schedule = FixSchedule(remoteItem.schedule);
        }
      }

      return matchingChocoPackages;
    }

    $scope.GetAllVersions = async function (item) {
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
        const existingPackage = await GetExistingPackages(item);
        item.otherVersions = item.otherVersions.concat(existingPackage);
      }

      const chocoResult = await PostApi(
        svc,
        $http,
        $q,
        "secure/choco/packages",
        {
          query: encoded,
          source: item.source,
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
            (x) => x.chocoPackage.Version == chocoItem.chocoPackage.Version
          );

          if (!existingPackage) {
            chocoItem.visible = true;
            toAdd.push(chocoItem);
          } else {
            existingPackage.visible = true;
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

    $scope.GetMinutesBetweenDates = function (date1, date2) {
      if (date1 && date2) {
        var startTime = new Date(date1);
        var endTime = new Date(date2);
        var difference = endTime.getTime() - startTime.getTime(); // This will give difference in milliseconds
        return RoundToTwo(difference / 60000);
      }
      return "";
    };

    $scope.SaveSettings = function (obj) {
      SaveSiteSettings("computerPackages", obj, svc, $q, $http);
    };

    $scope.settings = {
      computerPackages: {},
    };

    $scope.settings.computerPackages.order = ["chocoPackage.Title"];
    $scope.settings.computerPackages.reversed = false;
    $scope.settings.computerPackages.view = 1;

    $scope.OpenInfoModal = function (item) {
      $scope.selectedPackageItem = item;
      document.getElementById(
        "PackageModalDesc"
      ).innerHTML = converter.makeHtml(item.chocoPackage.Description);
      OpenModal("PackageModal");
    };

    $scope.Reorder = function (array, ignoreReverse, skipSave) {
      if (
        array[0] == $scope.settings.computerPackages.order[0] &&
        !ignoreReverse
      ) {
        $scope.settings.computerPackages.reversed = !$scope.settings
          .computerPackages.reversed;
      }

      $scope.settings.computerPackages.order = array;

      svc.data.scopePackages = $filter("orderBy")(
        svc.data.scopePackages,
        array,
        $scope.settings.computerPackages.reversed
      );
      $scope.items = svc.data.scopePackages;

      if (!skipSave) {
        $scope.SaveSettings($scope.settings);
      }
    };

    function RoundToTwo(num) {
      return +(Math.round(num + "e+2") + "e-2");
    }

    $scope.AddParam = function (item, param) {
      param = param + "|";
      var index = -1;

      if (item.command.parameters && item.command.parameters != "") {
        index = item.command.parameters.indexOf(param);
      }

      if (index == -1) {
        if (item.command.parameters) {
          item.command.parameters += param;
        } else {
          item.command.parameters = param;
        }
      } else {
        item.command.parameters = item.command.parameters.replace(param, "");
      }
    };

    $scope.AddTempParam = function (item, param) {
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

    $scope.GetPackages = function (allAvailable) {
      $scope.LoadingDone(false);

      if (allAvailable) {
        $scope.searchObj = null;
        svc.states.searchObj = $scope.searchObj;

        LoadChocoPackages(
          $http,
          svc,
          $filter,
          $routeParams,
          $q,
          "",
          true,
          false,
          $scope.searchObj
        ).then(() => {
          $scope.Reorder($scope.settings.computerPackages.order, true, true);
          $scope.LoadingDone(true);
        });

        $scope.listingAllAvailable = true;
        svc.states.listingAllAvailable = $scope.listingAllAvailable;
      } else {
        if ($scope.listingAllAvailable) {
          console.log("resetting after listingAllAvaliable");

          svc.data.packages.then((packageRes) => {
            svc.data.mergedPackages.items = [];
            svc.data.scopePackages = [];

            if (packageRes.data[0].packages.length != 0) {
              GetAllPackages(
                packageRes.data[0].packages,
                svc,
                $http,
                $filter,
                $routeParams,
                $q,
                true,
                true,
                false,
                false
              ).then(() => {
                $scope.Reorder(
                  $scope.settings.computerPackages.order,
                  true,
                  true
                );
                $scope.LoadingDone(true);
              });
            } else {
              $scope.LoadingDone(true);
              $scope.items = [];
            }
          });
        } else {
          $scope.LoadingDone(false);
          console.log("GetPackages: filtering");
          svc.data.scopePackages = $filter("filter")(
            svc.data.mergedPackages.items,
            $scope.searchObj,
            true
          );
          $scope.Reorder($scope.settings.computerPackages.order, true, true);
          $scope.LoadingDone(true);
        }

        $scope.listingAllAvailable = false;
        svc.states.listingAllAvailable = $scope.listingAllAvailable;
      }
    };

    svc.data.packages.then((packageRes) => {
      GetSiteSetting("profile", svc, $q, $http).then((setting) => {
        CheckWorkingPackage(packageRes.data[0].packages, svc);
      });

      GetAllPackages(
        packageRes.data[0].packages,
        svc,
        $http,
        $filter,
        $routeParams,
        $q,
        true,
        true,
        false,
        false
      ).then(() => {
        $scope.Reorder($scope.settings.computerPackages.order, true, true);
        $scope.LoadingDone(true);
      });
    });

    $scope.ChangePackage = function (item, type) {
      if (socket.connected) {
        if (item.command.tempparameters && item.command.tempparameters != "") {
          item.command.parameters = item.command.tempparameters;
        } else {
          item.command.parameters = "";
        }

        item.command.execAsUser = item.command.tempExecAsUser;

        var chocoPackage = item.chocoPackage;
        var package = {
          name: item.chocoPackage.Id,
        };
        var version = {
          packageHash: item.chocoPackage.PackageHash,
          version: item.chocoPackage.Version,
        };

        var source = item.source;

        item.command.status = "pending";

        if (type != "uninstall") {
          item.command.name = type;
          item.version = version;
        } else {
          if (!item.version) {
            item.command.name = type;
            item.command.status = "done";
          } else {
            item.command.name = type;
            version = item.version;
          }
        }

        var date = new Date();
        var startDate = new Date();
        var endDate = new Date();

        endDate = new Date(date.setDate(date.getDate() + 5));
        var date = new Date();
        startDate = new Date(date.setMinutes(date.getMinutes() - 1));

        item.schedule.startDate = null;
        item.schedule.endDate = null;
        item.schedule.startTime = null;
        item.schedule.endTime = null;
        item.schedule.type = 0;
        item.command.execStart = null;
        item.command.execDone = null;

        item.command.added = new Date().toISOString();

        var newItem = {
          version: version,
          package: package,
          command: item.command,
          schedule: item.schedule,
          source: source,
        };

        var data = {
          computerUIDs: [$routeParams.computerUID],
          packages: [newItem],
        };

        socket.emit("packageChange", data);
        item.modified = false;
      } else {
        ShowNotification(
          "No server connection, no changes was made.",
          0,
          "is-warning"
        );
      }
    };

    $scope.ShowConfirm = function (item) {
      OpenModal("ConfirmModal");

      item.command.tempparameters = item.command.parameters;
      item.command.tempExecAsUser = item.command.execAsUser;

      if (
        item.groupInfo &&
        item.groupInfo.group &&
        !DoesParamExist(item.command.tempparameters, "-f")
      ) {
        item.command.tempparameters = AddRemoveParam(
          item.command.tempparameters,
          "-f"
        );
      }

      if (DoesParamExist(item.command.tempparameters, "-n")) {
        item.command.tempparameters = AddRemoveParam(
          item.command.tempparameters,
          "-n"
        );
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
            $scope.selectedItem.temp = {};
            $scope.selectedItem.temp.oldVersion = true;
          }
        }
      }
    };

    $scope.GetComputerLog = function () {
      $scope.computer.systemInfo.isLoading = true;
      PostApi(svc, $http, $q, "secure/get/computerLog", {
        computerUID: $routeParams.computerUID,
        domainUID: $routeParams.domainUID,
      }).then((result) => {
        if (result.data && result.data.length !== 0 && result.data[0]) {
          let lines = result.data[0].split("\n");
          let firstLines = lines.slice(0, 1000);
          lines = lines.slice(1000, lines.length);

          let el = document.getElementById("computerLog");
          el.innerHTML = firstLines.join("\n");

          let toLoad = 10000;

          for (let i = 0; i < lines.length / toLoad; i++) {
            setTimeout(() => {
              el.innerHTML += lines
                .slice(i * toLoad, i * toLoad + toLoad)
                .join("");
            }, i * 1000);
          }
        }

        $scope.computer.systemInfo.isLoading = false;
      });
    };

    $scope.ShowPackageLogModal = function (item) {
      item.command.isLoading = true;
      OpenModal("PackageLogModal");
      $scope.selectedLogItem = item;

      PostApi(svc, $http, $q, "secure/get/computerPackageLog", {
        packageHash: item.version.packageHash,
        computerUID: $routeParams.computerUID,
        domainUID: $routeParams.domainUID,
      }).then((result) => {
        if (result.data && result.data.length !== 0 && result.data[0]) {
          let lines = result.data[0].split("\n");
          let firstLines = lines.slice(0, 1000);
          lines = lines.slice(1000, lines.length);

          let el = document.getElementById("packageLog");
          el.innerHTML = firstLines.join("\n");

          let toLoad = 10000;

          for (let i = 0; i < lines.length / toLoad; i++) {
            setTimeout(() => {
              el.innerHTML += lines
                .slice(i * toLoad, i * toLoad + toLoad)
                .join("");
            }, i * 1000);
          }
        }

        $scope.selectedLogItem.command.isLoading = false;
      });
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
          hour12: false,
        });
      }

      return "";
    };

    $scope.ShowVersionDd = ShowVersionDd;

    $scope.NavigateToApplications = function (computer) {
      Goto(
        $location,
        "domains/" +
          $routeParams.domainUID +
          "/computers/" +
          $routeParams.computerUID +
          "/applications"
      );
      HideLoading();
    };

    ChangeBackBtnUrl("domains/" + $routeParams.domainUID + "/computers");

    // $scope.UpdatePackageInfo = function (packageChange) {
    //     UpdatePackageInfo(packageChange);
    // }

    $scope.HideLoading = function () {
      HideLoading();
    };

    $scope.ShowLoading = function () {};

    $scope.DoesParamExist = function (params, param) {
      return DoesParamExist(params, param);
    };

    $scope.FocusForm = function (form, id) {
      FocusForm(form, id);
    };

    $rootScope.showBurger = true;

    $scope.$on("$destroy", function () {
      svc.states.updatePackages = false;
      SetStatusPanel(null, "", svc);
      svc.data.packages = null;
      svc.data.scopePackages = [];
      svc.data.mergedPackages.items = [];
      clearInterval(socketInterval);
    });

    $scope.Goto = function (event) {
      event.preventDefault();
      Goto($location, event.currentTarget.pathname);
    };
  },
]);
