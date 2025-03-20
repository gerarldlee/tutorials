app.controller("PowershellController", [
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
  function(
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

    
    svc.data.powershell = { complete: true, terminating: false, lines: [] };
    $scope.powershell = svc.data.powershell;
    $scope.computer = null;
    $scope.domain = null;

    FocusForm("commandForm", "command");

    svc.GetComputers();
    if (svc.data.computers) {
      svc.data.computers.then(function(res) {
        if (res.data.length > 0) {
          let computer = res.data[0].computers.find(
            x => x.uid === $routeParams.computerUID
          );
          if (computer) {
            $scope.computer = computer;
          }
        }
      });
    } else {
      console.log("No computers");
    }

    GetDomain($routeParams.domainUID, svc, $filter).then(domain => {
      $scope.domain = domain;
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

    $scope.Goto = function(event) {
      event.preventDefault();
      Goto($location, event.currentTarget.pathname);
    };

    $scope.FocusForm = function(form, id) {
      FocusForm(form, id);
    };

    $scope.SendCommand = function(command) {
      if (command != "") {
        if (!$scope.computer.online) {
          ShowNotification(
            "The target computer is offline.",
            5000,
            "is-warning"
          );
          return;
        } else if (!socket || !socket.connected) {
          ShowNotification(
            "The connection to the server is broken, can´t send command.",
            5000,
            "is-warning"
          );
          return;
        }

        if (command != ":stop:") {
          $scope.powershell.complete = false;
        } else if (command == ":stop:") {
          $scope.powershell.terminating = true;
        }

        SendPSCommand($routeParams.computerUID, command);
      }
    };

    $scope.$on("$destroy", function() {
      if (!$scope.powershell.complete && !$scope.powershell.terminating) {
        $scope.SendCommand(":stop:");
      }

      svc.data.powershell = { complete: true, terminating: false, lines: [] };
    });
  }
]);
