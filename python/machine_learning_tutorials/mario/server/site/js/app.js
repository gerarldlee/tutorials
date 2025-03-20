var userInfo = {};
var firstTime = false;
var modalShown = false;
var firstName = "";
var mail = "";
var socketDomainUID = "";
var socketInterval;
var socketConnecting = false;

var licenseEnabled = false;

var protocol = location.protocol + "//";
var domain = window.location.hostname.replace("app.", "");
var baseUrl = protocol + "api." + domain + "/";
var appBaseUrl = baseUrl;
var feedBaseUrl = baseUrl + "feed/";
var packageBaseUrl = baseUrl + "package/";

function Login(
  svc,
  $location,
  $httpParamSerializer,
  $http,
  username,
  password,
  $scope
) {
  Post($http, appBaseUrl + "login", {
    username: username,
    password: password,
    fp: $scope.fp,
  }).then(
    (res) => {
      if (res.status === 200) {
        let user = {
          userUID: res.data.userUID,
          firstName: res.data.firstName,
          lastName: res.data.lastName,
          mail: res.data.mail,
        };

        for (let prop in user) {
          svc.states.user[prop] = user[prop];
        }

        svc.states.user.isAuth = true;

        let encodedUser = btoa(JSON.stringify(user));
        localStorage.setItem("user", encodedUser);

        Goto($location, "/domains");
        $scope.isLoading = false;
      } else if (res.status === 201) {
        $scope.fpUID = res.data.uid;
        $scope.twoFactorAuth = true;
        $scope.twoFactorWhen = res.data.twoFactorWhen;

        if ($scope.twoFactorWhen !== "always") {
          $scope.trustBrowser = true;
        } else {
          $scope.trustBrowser = false;
        }

        svc.states.user.isAuth = false;
        $scope.isLoading = false;
        $scope.password = "";
        FocusForm("twoFactorAuthForm", "twoFaCode");
      } else {
        ShowNotification("Unexpected response.", 0, "is-warning");
      }
    },
    (err) => {
      svc.states.user.isAuth = false;
      svc.states.login = true;
      $scope.password = "";

      if (err.status == 401) {
        if (err.data.countLeft) {
          ShowNotification(
            "Wrong username or password (" + err.data.countLeft + " left)",
            4000,
            "is-warning"
          );
        } else {
          ShowNotification("Wrong username or password", 2000, "is-warning");
        }
      }

      if (err.status == 403) {
        ShowNotification(
          "No more tries, reset your password to login.",
          4000,
          "is-danger"
        );
      }

      $scope.isLoading = false;
    }
  );
}

function Logout(svc, $http, $q) {
  if (svc.states && svc.states.user && svc.states.user.isAuth) {
    svc.states.user.isAuth = false;
    Post($http, appBaseUrl + "secure/logout", {}).then(
      () => {},
      () => {}
    );
  } else {
    svc.states.user.isAuth = false;
  }

  localStorage.clear();

  for (let prop in svc.states.user) {
    svc.states.user[prop] = false;
  }

  for (let prop in svc.states.settings) {
    svc.states.settings[prop] = null;
  }

  svc.data = {
    mergedPackages: {},
  };

  if (socket && socket.connected) {
    socket.disconnect();
  }
}

var app = angular.module("Deployify", [
  "ngResource",
  "ngRoute",
  "ngTouch",
  "ngFileUpload",
]);

app
  .config([
    "$routeProvider",
    "$locationProvider",
    function ($routeProvider, $locationProvider) {
      $routeProvider
        .when("/unavailable", {
          templateUrl: "/views/unavailable.html",
          controller: "UnavailableController",
          resolve: function () {},
        })
        .when("/unseal", {
          templateUrl: "/views/unseal.html",
          controller: "UnsealController",
          resolve: function () {},
        })
        .when("/signup", {
          templateUrl: "/views/signup.html",
          controller: "SignupController",
          resolve: function () {},
        })
        .when("/domains", {
          templateUrl: "/views/domains.html",
          controller: "DomainController",
          resolve: function () {},
        })
        .when("/repos/:sourceUID", {
          templateUrl: "/views/sourcepackages.html",
          controller: "SourcePackageController",
          resolve: function () {},
        })
        .when("/repos/:sourceUID/generate", {
          templateUrl: "/views/package.html",
          controller: "PackageController",
          resolve: function () {},
        })
        .when("/domains/:domainUID/", {
          templateUrl: "/views/computers.html",
          controller: "ComputerController",
          resolve: function () {},
        })
        .when("/domains/:domainUID/computers/:computerUID/packages", {
          templateUrl: "/views/computerpackages.html",
          controller: "ComputerPackageController",
          resolve: function () {},
        })
        .when("/domains/:domainUID/computers/applications", {
          templateUrl: "/views/computersapplications.html",
          controller: "ComputersApplicationsController",
          resolve: function () {},
        })
        .when("/domains/:domainUID/computers/:computerUID/applications", {
          templateUrl: "/views/computerapplications.html",
          controller: "ComputerApplicationController",
          resolve: function () {},
        })
        .when("/domains/:domainUID/computers/:computerUID/powershell", {
          templateUrl: "/views/computerpowershell.html",
          controller: "PowershellController",
          resolve: function () {},
        })
        .when("/domains/:domainUID/shared/", {
          templateUrl: "/views/shareddomains.html",
          controller: "SharedDomainsController",
          resolve: function () {},
        })
        .when("/login", {
          templateUrl: "/views/login.html",
          controller: "LoginController",
          resolve: function () {},
        })
        .when("/resetpassword/:autoChallange", {
          templateUrl: "/views/passwordreset.html",
          controller: "ResetPasswordController",
          resolve: function () {},
        })
        .when("/logout", {
          templateUrl: "/views/logout.html",
          controller: "LogoutController",
          resolve: function () {},
        })
        .when("/profile", {
          templateUrl: "/views/profile.html",
          controller: "ProfileController",
          resolve: function () {},
        })
        .when("/domains/:domainUID/groups/:groupUID/packages", {
          templateUrl: "/views/grouppackages.html",
          controller: "GroupPackageController",
          resolve: function () {},
        })
        .otherwise({
          redirectTo: "/domains",
        });

      $locationProvider.html5Mode(true);
      $locationProvider.hashPrefix("");
    },
  ])
  .directive("rightClick", [
    "$compile",
    function ($compile) {
      document.oncontextmenu = function (e) {
        if (e && e.target.hasAttribute("right-click")) {
          return false;
        }
      };

      return function ($scope, el, attrs) {
        el.bind("contextmenu", function (e) {
          e.stopPropagation();
          e.preventDefault();

          var menu = "";
          let perm = attrs.permission;
          let manageable = attrs.manageable;

          if (attrs.rightClick === "domain") {
            if ((perm && perm >= 16) || !perm) {
              menu +=
                "<a href=\"\" ng-click=\"EditDomain(domain); FocusForm('editDomainForm', 'name');\" >Edit</a>";
            }

            if ((perm && perm >= 256) || !perm) {
              menu +=
                '<a ng-href="domains/{{domain.uid}}/shared" ng-click="Goto($event)" >Share</a>';
            }

            if ((perm && perm >= 128) || !perm) {
              menu +=
                '<a href="" ng-click="DeleteDomainConfirm(domain)" >Delete</a>';
            }
          }

          if (attrs.rightClick === "source") {
            if ((perm && perm >= 32) || !perm) {
              menu +=
                "<a href=\"\" ng-click=\"EditSource(source); FocusForm('editSourceForm', 'name');\">Edit</a>";
            }
            if ((perm && perm >= 8) || !perm) {
              if (manageable == "true") {
                menu += `<a ng-href="repos/{{source.uid}}/generate" ng-click="Goto($event)">Generate package</a>`;
              }
            }
            // if ((perm && perm >= 1) || !perm) {
            //   menu += `<a href="${link}/packages" ng-click="Goto($event)" target="_blank">Raw source</a>`;
            // }
            if ((perm && perm >= 32) || !perm) {
              menu +=
                '<a href="" ng-click="DeletePackageSourceConfirm(source)" >Delete</a>';
            }
          }

          if (attrs.rightClick === "group") {
            if ((perm && perm >= 16) || !perm) {
              menu +=
                "<a href=\"\" ng-click=\"EditGroupName(item); FocusForm('groupForm', 'name');\" >Edit</a>";
            }

            if ((perm && perm >= 16) || !perm) {
              menu +=
                "<a href=\"\" ng-click=\"EditGroupComputers(item); FocusForm('groupEditComputersForm', 'groupEditComputers');\" >Edit computers</a>";
            }

            if ((perm && perm >= 8) || !perm) {
              menu +=
                '<a href="" ng-click="RequestWOLForGroup(item)" >Wake computers</a> ';
            }

            if ((perm && perm >= 64) || !perm) {
              menu +=
                '<a href="" ng-click="DeleteGroupConfirm(item)" >Delete</a>';
            }
          }

          if (attrs.rightClick === "computer") {
            if ((perm && perm >= 16) || !perm) {
              menu +=
                "<a href=\"\" ng-click=\"ChangeComputerSelections(data.computers); EditComputer(computer); FocusForm('editComputerForm', 'name');\" >Edit</a>";
            }
            if (
              (licenseEnabled && perm && perm >= 64) ||
              (!perm && licenseEnabled)
            ) {
              menu +=
                ' <a href="" ng-click="ManageLicense(computer)" >Manage license</a>';
            }
            if ((perm && perm >= 8) || !perm) {
              menu +=
                ' <a href="" ng-click="RequestWOLForComputer(computer)" >Wake computer</a>';
            }
            if ((perm && perm >= 64) || !perm) {
              menu += `<a ng-href="/domains/{{domain.uid}}/computers/{{computer.uid}}/powershell" ng-click="Goto($event)">Powershell</a>`;
            }
            if ((perm && perm >= 64) || !perm) {
              menu +=
                ' <a href="" ng-click="DeleteComputerConfirm(computer)" >Delete</a>';
            }
          }

          if (attrs.rightClick === "license") {
            if ((perm && perm >= 16) || !perm) {
              menu +=
                "<a href=\"\" ng-click=\"Edit(application); FocusForm('licenseForm', 'key');\">Edit</a>";
            }
          }

          ShowContextMenu(e, $scope, $compile, menu);
        });
      };
    },
  ]);

function CheckInfo(svc, $location) {
  let userStr = localStorage.getItem("user");
  if (userStr) {
    let user = JSON.parse(atob(userStr));
    for (let prop in user) {
      svc.states.user[prop] = user[prop];
    }

    svc.states.user.isAuth = true;
  }
}

function RenewToken(token, svc) {
  if (token && token != "") {
    svc.states.user.token = token;
    let userStr = localStorage.getItem("user");
    if (userStr) {
      let user = JSON.parse(atob(userStr));
      if (user) {
        user.token = token;
        let encodedUser = btoa(JSON.stringify(user));
        localStorage.setItem("user", encodedUser);
      }
    }
  }
}

function guid() {
  function _p8(s) {
    var p = (Math.random().toString(16) + "000000000").substr(2, 8);
    return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
  }
  return _p8() + _p8(true) + _p8(true) + _p8();
}

function CheckMail(Mail) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(Mail);
}

app.factory("svc", function ($q, $http, $routeParams) {
  return {
    states: {
      user: {},
      settings: {},
      listingAllAvailable: false,
      searchObj: null,
      workingPackage: null,
      updatePackages: false,
      serverSettings: {},
    },
    data: {
      chocoPackages: null,
      chocoPackagesFlat: [],
      packages: null,
      groupPackages: null,
      domains: null,
      computers: null,
      groups: null,
      groupComputers: null,
      packageSources: null,
      applications: null,
      mergedPackages: {
        groupItems: [],
        items: [],
        searchItems: [],
      },
      scopePackages: [],
      powershell: { complete: true, terminating: false, lines: [] },
    },

    GetDomains() {
      return (this.data.domains = PostApi(
        this,
        $http,
        $q,
        "secure/get/domains",
        {}
      ));
    },

    GetComputers(domainUID) {
      if (!domainUID) {
        domainUID = $routeParams.domainUID;
      }

      if (domainUID && domainUID != "") {
        return (this.data.computers = PostApi(
          this,
          $http,
          $q,
          "secure/get/domainComputers",
          {
            domainUID: domainUID,
          }
        ));
      } else {
        return null;
      }
    },

    GetGroups(domainUID) {
      if (!domainUID) {
        domainUID = $routeParams.domainUID;
      }

      return (this.data.groups = PostApi(
        this,
        $http,
        $q,
        "secure/get/domainGroups",
        {
          domainUID: $routeParams.domainUID,
        }
      ));
    },
    GetChocoPackages(source, filter) {
      if (!filter) {
        filter =
          "Packages?$top=5&$filter=IsLatestVersion%20eq%20true&$orderby=DownloadCount%20desc";
      }

      if (!this.data.chocoPackages) {
        this.data.chocoPackages = [];
      }

      this.data.chocoPackages.push(
        PostApi(this, $http, $q, "secure/choco/packages", {
          query: filter,
          source,
        })
      );

      return this.data.chocoPackages;
    },

    GetComputerPackages() {
      return (this.data.packages = PostApi(
        this,
        $http,
        $q,
        "secure/get/computerPackages",
        {
          domainUID: $routeParams.domainUID,
          computerUIDs: [$routeParams.computerUID],
        }
      ));
    },

    GetLatestComputerPackages() {
      return (this.data.packages = PostApi(
        this,
        $http,
        $q,
        "secure/get/latestComputerPackages",
        {
          domainUID: $routeParams.domainUID,
          computerUIDs: [$routeParams.computerUID],
        }
      ));
    },

    GetApplications() {
      return (this.data.applications = PostApi(
        this,
        $http,
        $q,
        "secure/get/computerApplications",
        {
          domainUID: $routeParams.domainUID,
          computerUIDs: [$routeParams.computerUID],
        }
      ));
    },

    GetComputersApplications() {
      return (this.data.computersApplications = PostApi(
        this,
        $http,
        $q,
        "secure/get/computersApplications",
        {
          domainUID: $routeParams.domainUID,
        }
      ));
    },

    GetGroupPackages() {
      return (this.data.groupPackages = PostApi(
        this,
        $http,
        $q,
        "secure/get/groupPackages",
        {
          domainUID: $routeParams.domainUID,
          groupUID: $routeParams.groupUID,
        }
      ));
    },

    GetGroupComputers() {
      return (this.data.groupComputers = PostApi(
        this,
        $http,
        $q,
        "secure/get/groupComputers",
        {
          domainUID: $routeParams.domainUID,
          groupUID: $routeParams.groupUID,
        }
      ));
    },

    GetPackageSources() {
      this.data.packageSources = PostApi(
        this,
        $http,
        $q,
        "secure/get/packageSources",
        {}
      );
      this.data.packageSources.then((packageRes) => {
        for (let source of packageRes.data) {
          source = FormSource(source);
        }
      });
    },

    GetDomainPackageSources() {
      this.data.packageSources = PostApi(
        this,
        $http,
        $q,
        "secure/get/domainPackageSources",
        {
          domainUID: $routeParams.domainUID,
        }
      );
      this.data.packageSources.then((packageRes) => {
        for (let source of packageRes.data) {
          source = FormSource(source);
        }
      });
    },
  };
});

function GetServerSettings(svc, $http, $q) {
  Post($http, appBaseUrl + "get/settings").then(
    (res) => {
      if (res.data) {
        for (let prop in res.data) {
          svc.states.serverSettings[prop] = res.data[prop];
        }

        if (svc.states.serverSettings.licenseEnabled === undefined) {
          svc.states.serverSettings.licenseEnabled = true;
          licenseEnabled = true;
        } else {
          licenseEnabled = svc.states.serverSettings.licenseEnabled;
        }

        if (svc.states.serverSettings.sealed) {
          if (svc.states.serverSettings.webUnsealEnabled) {
            let goto =
              window.location.protocol +
              "//" +
              window.location.hostname +
              "/unseal";
            history.pushState({}, null, goto);
          } else {
            let goto =
              window.location.protocol +
              "//" +
              window.location.hostname +
              "/unavailable";
            history.pushState({}, null, goto);
          }
        }
      }
    },
    (err) => {
      console.log("could not get settings");
      console.log(err);
    }
  );
}

app.run(function (svc, $rootScope, $location, $http, $q) {
  GetServerSettings(svc, $http);

  $rootScope.Goto = function (newPath) {
    Goto($location, newPath);
  };

  $rootScope.$on("$routeChangeStart", function (event, next, prev) {
    if (
      $location.path() != "/signup" &&
      $location.path() != "/login" &&
      $location.path() != "/unseal" &&
      $location.path() != "/unavailable" &&
      !$location.path().includes("/resetpassword")
    ) {
      CheckInfo(svc, $location, false);
      // GetSiteSetting("notifications", svc, $q, $http).then(() => {
      //   GetSiteSetting("infobar", svc, $q, $http);
      // });
    }
  });

  $rootScope.$on("$routeChangeSuccess", function (event, next, prev) {});
});

app.controller("FeedbackController", [
  "$scope",
  "svc",
  "$http",
  function ($scope, svc, $http) {
    $scope.user = svc.states.user;
    //console.log($scope.mail, svc.states)

    $scope.CloseModal = function (modalName) {
      CloseModal(modalName);
    };

    $scope.SendFeedback = function (mail, text) {
      $scope.CloseModal("feedbackModal");
      console.log("Sending feedback...");
      Post($http, baseUrl + "feedback/QiiUq7vyVqliqlW20eLC", {
        data: {
          mail: $scope.user.mail,
          text: text,
          wantResponse: false,
        },
      }).then(
        function (ReturnObject) {
          // console.log("Sending feedback is done.");
          ShowNotification("Thank you!", 5000);
          HideLoading();
        },
        (err) => {
          ShowNotification(
            "Could not send feedback. Please try again later.",
            0
          );
          HideLoading();
        }
      );
    };
  },
]);

app.controller("LoginController", [
  "$scope",
  "$location",
  "svc",
  "$http",
  "$httpParamSerializer",
  function ($scope, $location, svc, $http, $httpParamSerializer) {
    $scope.firstLoad = true;
    $scope.fp = null;
    $scope.serverSettings = svc.states.serverSettings;

    $scope.code = "";

    $scope.Goto = function (event) {
      event.preventDefault();
      Goto($location, event.currentTarget.pathname);
    };

    var options = {
      excludes: {
        // userAgent: true,
        // language: true
      },
    };

    $scope.$on("$viewContentLoaded", function (event) {
      FP.getPromise().then((components) => {
        var values = components.map((component) => {
          return component.value;
        });
        var hash = FP.x64hash128(values.join(""));
        $scope.fp = hash;
        $scope.firstLoad = false;
        $scope.$digest();
        FocusForm("loginForm", "mail");
      });
    });

    $scope.KeyPressEvnt = function (e) {
      if (e) {
        var keycode = e.keyCode ? e.keyCode : e.which;
        if (keycode == 13) {
          if (!$scope.twoFactorAuth && $scope.loginForm.$valid) {
            $scope.isLoading = true;
            Login(
              svc,
              $location,
              $httpParamSerializer,
              $http,
              $scope.mail,
              $scope.password,
              $scope
            );
          } else if ($scope.twoFactorAuth && $scope.twoFactorAuthForm.$valid) {
            $scope.VerifyTwoFA($scope.twoFaCode);
          }
        }
      }
    };

    $scope.VerifyTwoFA = function (code) {
      $scope.isLoading = true;
      Post($http, appBaseUrl + "2fa/verify", {
        challange: code,
        fp: $scope.fp,
        uid: $scope.fpUID,
        mail: $scope.mail,
        trustBrowser: $scope.trustBrowser,
      }).then(
        (res) => {
          if (res.status === 200) {
            let user = {
              userUID: res.data.userUID,
              firstName: res.data.firstName,
              lastName: res.data.lastName,
              mail: res.data.mail,
            };

            for (let prop in user) {
              svc.states.user[prop] = user[prop];
            }

            svc.states.user.isAuth = true;

            let encodedUser = btoa(JSON.stringify(user));
            localStorage.setItem("user", encodedUser);

            $scope.isLoading = false;
            Goto($location, "/domains");
          }
        },
        (err) => {
          svc.states.user.isAuth = false;
          svc.states.login = true;
          $scope.code = "";
          $scope.twoFactorAuth = false;
          $scope.isLoading = false;

          if (err.status == 401) {
            ShowNotification("Incorrect code.", 4000, "is-warning");
          } else if (err.status == 400) {
            ShowNotification("Bad request.", 4000, "is-warning");
          } else {
            ShowNotification("Unknown error.", 4000, "is-warning");
          }
        }
      );
    };

    $scope.Login = function () {
      $scope.isLoading = true;
      Login(
        svc,
        $location,
        $httpParamSerializer,
        $http,
        $scope.mail,
        $scope.password,
        $scope
      );
    };

    $scope.SendResetMail = function (mail) {
      ShowLoading();

      Post($http, appBaseUrl + "user/sendpasswordlink", {
        data: {
          mail: mail,
        },
      }).then(
        (res) => {
          if (res.data && res.data.code) {
            $scope.code = res.data.code;
            ShowNotification("Check your inbox.", 10000, "green");
          } else {
            ShowNotification("Something went wrong.", 2000, "red");
          }

          HideLoading();
        },
        (err) => {
          $scope.code = "";
          if (err.status == 400) {
            ShowNotification("The account does not exist.", 10000);
          } else {
            ShowNotification("Failed.", 2000, "red");
          }

          HideLoading();
        }
      );
    };

    $scope.FocusForm = function (form, id) {
      FocusForm(form, id);
    };
  },
]);

app.factory("itemService", function () {
  return {
    items: [],
  };
});

function GetLatestChocoPackageVersionFromPkg(pkg, $http, $q, svc) {
  let defer = $q.defer();

  if (pkg.chocoPackage && pkg.chocoPackage.IsLatestVersion) {
    defer.resolve(pkg.chocoPackage.Version);
  } else {
    GetLatestChocoVersion(pkg.package.name, pkg.source, $http, $q, svc).then(
      (result) => {
        if (result && result.data.length != 0) {
          defer.resolve(result.data.packages[0].chocoPackage.Version);
        } else {
          defer.reject(null);
        }
      }
    );
  }

  return defer.promise;
}

function GetLatestChocoVersion(packageName, source, $http, $q, svc) {
  encoded = `Packages?$filter=Id%20eq%20%27${packageName}%27%20and%20IsLatestVersion%20eq%20true&$select=Version`;
  return PostApi(svc, $http, $q, "secure/choco/packages", {
    query: encoded,
    source: source,
  });
}

function GetLatestChocoPackage(packageName, source, $http, $q, svc) {
  encoded = `Packages?$filter=Id%20eq%20%27${packageName}%27%20and%20IsLatestVersion%20eq%20true`;
  return PostApi(svc, $http, $q, "secure/choco/packages", {
    query: encoded,
    source: source,
  });
}

function GetLatestChocoPackageFilter(packageName, version, currentUrl) {
  let filter = "";
  if (version && version != "") {
    filter = `Id%20eq%20%27${packageName}%27%20and%20Version%20eq%20%27${version}%27`;
  } else {
    filter = `Id%20eq%20%27${packageName}%27%20and%20IsLatestVersion%20eq%20true`;
  }

  if (currentUrl && currentUrl != "") {
    return `${currentUrl}%20or%20${filter}`;
  } else {
    return `Packages?$filter=${filter}`;
  }
}

// function GetLatestChocoVersionFilter(packageName, currentUrl) {
//   let filter =
//     "Id%20eq%20%27" +
//     packageName + "%27%20and%20IsLatestVersion%20eq%20true&$select=Version";

//   if (currentUrl && currentUrl != "") {
//     return currentUrl + "%20or%20" + filter;
//   } else {
//     return "$filter=" + filter;
//   }
// }

function GetDomainPackageSourcesIfNess(svc, $routeParams) {
  return new Promise(async (resolve) => {
    if (svc.data.packageSources) {
      let sourceRes = await svc.data.packageSources;
      if (
        sourceRes.data &&
        sourceRes.data.length !== 0 &&
        sourceRes.data[0] &&
        sourceRes.data[0].domainUID === $routeParams.domainUID
      ) {
        resolve(false);
      } else {
        svc.GetDomainPackageSources();
        resolve(true);
      }
    } else {
      svc.GetDomainPackageSources();
      resolve(true);
    }
  });
}

function GetMatchingChocoPackages(
  packageArray,
  svc,
  $http,
  $routeParams,
  $q,
  matchVersion,
  skipMatchVersionIfAutoUpdate
) {
  var defer = $q.defer();

  GetDomainPackageSourcesIfNess(svc, $routeParams).then(() => {
    var filterArray = [];
    var currentFilter = "";

    svc.data.packageSources.then((sourceRes) => {
      for (let currentSource of sourceRes.data) {
        //console.log(currentSource.uid)

        var currentPackages = packageArray.filter(
          (x) => x.source.uid === currentSource.uid
        );

        var arrayLength = currentPackages.length - 1;

        for (let [key, item] of currentPackages.entries()) {
          item.source = currentSource;

          if (
            !matchVersion ||
            (skipMatchVersionIfAutoUpdate && item.schedule.type == 1)
          ) {
            currentFilter = GetLatestChocoPackageFilter(
              item.package.name,
              null,
              currentFilter
            );
          } else {
            currentFilter = GetLatestChocoPackageFilter(
              item.package.name,
              item.version.version,
              currentFilter
            );
          }

          if (currentFilter.length > 1900 || arrayLength == key) {
            filterArray.push({
              filter: currentFilter,
              source: currentSource,
            });
            currentFilter = "";
          }
        }
      }

      svc.data.chocoPackagesFlat = [];
      var promiseArray = [];

      for (let currentFilter of filterArray) {
        promiseArray.push(
          PostApi(svc, $http, $q, "secure/choco/packages", {
            query: currentFilter.filter,
            source: currentFilter.source,
          })
        );
      }

      $q.all(promiseArray).then((resArray) => {
        for (let res of resArray) {
          svc.data.chocoPackagesFlat = svc.data.chocoPackagesFlat.concat(
            res.data.packages
          );
        }

        defer.resolve(svc.data.chocoPackagesFlat);
      });
    });
  });

  return defer.promise;
}

function SaveSiteSettings(key, value, svc, $q, $http) {
  let defer = $q.defer();

  if (!svc.states.settings[key]) {
    svc.states.settings[key] = {};
  }

  if (typeof value === "object") {
    for (let prop in value) {
      svc.states.settings[key][prop] = value[prop];
    }

    value = JSON.stringify(value);
  }

  PostApi(svc, $http, $q, "secure/set/userSiteSettings", {
    settings: {
      [key]: value,
    },
  }).then(
    function (res) {
      defer.resolve(res.data);
    },
    (err) => {
      defer.reject(err);
    }
  );

  return defer.promise;
}

function GetSiteSetting(key, svc, $q, $http) {
  let defer = $q.defer();

  if (!svc.states.settings[key]) {
    PostApi(svc, $http, $q, "secure/get/userSiteSetting", {
      key: key,
    }).then(
      function (res) {
        if (res.data.length > 0 && res.data[0].value) {
          let data = res.data[0].value;

          if (typeof data === "string" && data.startsWith("{")) {
            data = JSON.parse(data);
          } else {
            data = res.data[0].value;
          }

          if (!svc.states.settings[key]) {
            svc.states.settings[key] = {};
          }

          for (let prop in data) {
            svc.states.settings[key][prop] = data[prop];
          }

          defer.resolve(svc.states.settings[key]);
        }

        defer.resolve(null);
      },
      () => {
        defer.resolve(null);
        // ShowNotification("Could get setting", null, "is-warning");
      }
    );
  } else {
    defer.resolve(svc.states.settings[key]);
  }

  return defer.promise;
}

function ChangeBackBtnUrl(newUrl) {
  // var BackBtn = document.getElementById("BackBtn");
  // BackBtn.href = newUrl;
}

function ShowLoading() {
  var loading = document.getElementById("LoadingDiv");
  loading.style.visibility = "visible";
}

function GetRandomColor() {
  var colors = [
    "red",
    "pink",
    "purple",
    "deep-purple",
    "indigo",
    "brown",
    "blue-gray",
    "teal",
    "cyan",
    "green",
    "lime",
    "amber",
    "yellow",
    "orange",
  ];
  var randomnumber = Math.floor(Math.random() * colors.length);
  //console.log(randomnumber);
  var color = colors[randomnumber] + "-text lighten-1";
  //console.log(color);
  return color;
}

function AddRemoveParam(str, param) {
  param = param + "|";
  var index = -1;

  if (str && str != "") {
    index = str.indexOf(param);
  }

  if (index == -1) {
    if (str) {
      str += param;
    } else {
      str = param;
    }
  } else {
    str = str.replace(param, "");
  }

  return str;
}

function DoesParamExist(str, param) {
  var index = -1;

  if (str && str != "") {
    index = str.indexOf(param);
  }

  if (index != -1) {
    return true;
  }

  return false;
}

function ValidateSchedule(item) {
  if (
    !item.schedule ||
    !ValidateDate(item.schedule.startDate) ||
    !ValidateDate(item.schedule.endDate) ||
    !ValidateDate(item.schedule.startTime) ||
    !ValidateDate(item.schedule.endTime) ||
    !item.schedule.repeatWeekDays ||
    item.schedule.repeatWeekDays == ""
  ) {
    return false;
  }

  return true;
}

function ValidateExactSchedule(schedule) {
  if (
    !schedule ||
    !ValidateDate(schedule.startDate) ||
    !ValidateDate(schedule.endDate) ||
    !ValidateDate(schedule.startTime) ||
    !ValidateDate(schedule.endTime) ||
    !schedule.repeatWeekDays ||
    schedule.repeatWeekDays == ""
  ) {
    return false;
  }

  return true;
}

function ValidateDate(date) {
  try {
    if (date && angular.isDate(date)) {
      var d = date.toISOString();
      regex = /^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i;
      return regex.test(d);
    }
  } catch (ex) {}

  return false;
}

function HideLoading() {
  var loading = document.getElementById("LoadingDiv");
  loading.style.visibility = "hidden";
}

function unique(array) {
  return array.filter(function (el, index, arr) {
    return index === arr.indexOf(el);
  });
}

function ConvertToDate(dateStr) {
  if (dateStr && dateStr != "") {
    if (typeof dateStr === "string" && !dateStr.includes(":")) {
      dateStr = parseInt(dateStr);
    }

    var dateObj = new Date(dateStr);
    return dateObj;
  }

  return null;
}

function TimeBetweenDates(date1, date2) {
  if (date1 && date2) {
    var startTime = new Date(date1);
    var endTime = new Date(date2);
    var difference = endTime.getTime() - startTime.getTime(); // This will give difference in milliseconds
    return Math.round(difference / 60000);
  }
  return "";
}

function RoundToTwo(num) {
  return +(Math.round(num + "e+2") + "e-2");
}

function FixSchedule(schedule) {
  if (schedule) {
    schedule.startDate = ConvertToDate(schedule.startDate);
    schedule.endDate = ConvertToDate(schedule.endDate);
    schedule.startTime = ConvertToDate(schedule.startTime);
    schedule.endTime = ConvertToDate(schedule.endTime);

    return schedule;
  } else {
    return schedule;
  }
}

function GetFileExtension(filename) {
  var ext = /^.+\.([^.]+)$/.exec(filename);
  return ext == null ? "" : ext[1];
}

function Goto($location, newPath) {
  //console.log("changing location to: " + newPath);
  $location.path(newPath);
}

function ValidateGuid(value) {
  var regex = /[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}/i;
  var match = regex.exec(value);
  return match != null;
}

function PostApi(svc, $http, $q, path, data) {
  var defer = $q.defer();

  if (svc.states.user.isAuth) {
    var req = {
      method: "POST",
      url: appBaseUrl + path,
      withCredentials: true,
      data: {
        data,
      },
    };

    $http(req).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        if (error.status === 401) {
          svc.states.user.isAuth = false;
          GoToLogout();
          defer.reject(error);
        } else {
          console.log(error);
          defer.reject(error);
        }
      }
    );
  } else {
    GoToLogout();
    defer.reject({});
  }

  return defer.promise;
}

function GoToLogout() {
  var logoutUrl =
    window.location.protocol + "//" + window.location.hostname + "/logout";

  if (!window.location.href.includes(logoutUrl)) {
    history.pushState({}, null, logoutUrl);
  }
}

function Post($http, urlPath, data) {
  var req = {
    method: "POST",
    url: urlPath,
    withCredentials: true,
    headers: {
      "content-type": "application/json",
    },
    data: data,
  };
  return $http(req);
}

function Get($http, url) {
  return $http.get(url);
}

function FirstLetterCap(str) {
  if (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  } else {
    return "";
  }
}

function SetStatusPanel(str, css) {
  let statusPanel = document.getElementById("statusPanel");
  if (statusPanel) {
    if (str) {
      statusPanel.innerText = str;
      statusPanel.style.display = "block";
      statusPanel.setAttribute("class", "custom-badge " + css);
    } else {
      statusPanel.style.display = "none";
    }
  }
}

function CheckWorkingPackage(packages, svc, $q, $http) {
  return new Promise((resolve, reject) => {
    let workingPackage = packages.find((item) => {
      return item.command.status == "working";
    });

    let workingPackageDone = null;

    if (
      svc.states.workingPackage &&
      svc.states.workingPackage.version &&
      svc.states.workingPackage.version.packageHash
    ) {
      workingPackageDone = packages.find(
        (item) =>
          item.command.status != "working" &&
          item.version.packageHash ==
            svc.states.workingPackage.version.packageHash
      );
    }

    if (workingPackage) {
      svc.states.workingPackage = workingPackage;

      let commandName = workingPackage.command.name;
      if (commandName == "upgrade") {
        commandName = "upgrad";
      }

      if (
        svc.states.settings &&
        svc.states.settings.profile &&
        svc.states.settings.profile.infobar &&
        svc.states.settings.profile.infobar.workingStatus
      ) {
        SetStatusPanel(
          FirstLetterCap(commandName) +
            "ing: " +
            workingPackage.package.name +
            " " +
            workingPackage.version.version,
          "has-background-info",
          svc
        );
      }
    } else if (workingPackageDone) {
      svc.states.workingPackage = null;
      SetStatusPanel();
    } else {
    }
    resolve();
  });
}

function UpdatePackageInfo(
  newItems,
  svc,
  $filter,
  $routeParams,
  $q,
  force,
  $http,
  notify = true
) {
  return new Promise(() => {
    let notifications = false;
    if (
      svc.states.settings.profile &&
      svc.states.settings.profile.notifications &&
      svc.states.settings.profile.notifications.packageChange != null
    ) {
      notifications = svc.states.settings.profile.notifications.packageChange;
    }

    var matchingComputerUID = $filter("filter")(
      newItems.computerUIDs,
      $routeParams.computerUID,
      true
    );
    if (
      $routeParams.groupUID ||
      (matchingComputerUID &&
        matchingComputerUID[0] == $routeParams.computerUID)
    ) {
      if ($routeParams.groupUID) {
        var computerUIDs = [];
        var computers = [];

        GetGroupItem($routeParams.groupUID, svc, $filter, (currentItem) => {
          if (currentItem) {
            computers = currentItem.computers;
            computerUIDs = currentItem.computers.map(
              (computer) => computer.uid
            );
          }

          if (svc.data.packages) {
            svc.data.packages.then((packageRes) => {
              for (let arrayItem of newItems.packages) {
                var filtered = $filter("filter")(
                  packageRes.data[0].packages,
                  {
                    version: {
                      packageHash: arrayItem.version.packageHash,
                    },
                    source: {
                      uid: arrayItem.source.uid,
                    },
                    computerUID: arrayItem.computerUID,
                  },
                  true
                );

                if (filtered.length == 0) {
                  packageRes.data[0].packages.push(arrayItem);
                  filtered = $filter("filter")(
                    packageRes.data[0].packages,
                    {
                      version: {
                        packageHash: arrayItem.version.packageHash,
                      },
                      source: {
                        uid: arrayItem.source.uid,
                      },
                      computerUID: arrayItem.computerUID,
                    },
                    true
                  );
                }

                var currentItem = filtered[0];
                currentItem.command = arrayItem.command;
                //currentItem.groupInfo = arrayItem.groupInfo;

                var filteredGroupItems = $filter("filter")(
                  svc.data.mergedPackages.items,
                  {
                    chocoPackage: {
                      PackageHash: arrayItem.version.packageHash,
                    },
                  },
                  true
                );
                var groupItem = filteredGroupItems[0];

                if (groupItem) {
                  var filteredGroupPackages = $filter("filter")(
                    packageRes.data[0].packages,
                    {
                      version: {
                        packageHash: arrayItem.version.packageHash,
                      },
                      source: {
                        uid: arrayItem.source.uid,
                      },
                    },
                    true
                  );

                  GetPackageStats(
                    filteredGroupPackages,
                    computers,
                    groupItem,
                    $filter
                  );
                }
              }
            });
          }
        });
      } else {
        CheckWorkingPackage(newItems.packages, svc);

        if (svc.data.packages && svc.data.packages) {
          svc.data.packages.then((packageRes) => {
            svc.data.packageSources.then((sourceRes) => {
              for (let newItem of newItems.packages) {
                if (newItem.computerUID == $routeParams.computerUID) {
                  let noticeDone = false;

                  var existingMergedPackages = $filter("filter")(
                    svc.data.mergedPackages.items,
                    {
                      chocoPackage: {
                        Id: newItem.package.name,
                      },
                      source: {
                        uid: newItem.source.uid,
                      },
                    },
                    true
                  );

                  var existingPackages = $filter("filter")(
                    packageRes.data[0].packages,
                    {
                      version: {
                        packageHash: newItem.version.packageHash,
                      },
                      source: {
                        uid: newItem.source.uid,
                      },
                    },
                    true
                  );

                  if (existingPackages.length != 0) {
                    existingPackages[0].command = newItem.command;
                    //existingPackages[0].groupInfo = newItem.groupInfo;
                  } else {
                    packageRes.data[0].packages.push(newItem);
                  }

                  if (existingMergedPackages.length == 0) {
                    if (!svc.states.listingAllAvailable) {
                      //console.log("package does not exist");

                      var sources = $filter("filter")(
                        sourceRes.data,
                        {
                          uid: newItem.source.uid,
                        },
                        true
                      );
                      if (sources.length != 0) {
                        source = sources[0];
                        newItem.source = source;

                        GetLatestChocoPackage(
                          newItem.package.name,
                          source,
                          $http,
                          $q,
                          svc
                        ).then((result) => {
                          var chocoItem = result.data.packages[0];

                          var existingItems = $filter("filter")(
                            svc.data.mergedPackages.items,
                            {
                              chocoPackage: {
                                Id: newItem.package.name,
                              },
                              source: {
                                uid: newItem.source.uid,
                              },
                            },
                            true
                          );

                          if (existingItems.length != 0) {
                            existingItems[0].command = newItem.command;
                          } else {
                            if (chocoItem) {
                              if (
                                chocoItem.chocoPackage.Version ==
                                newItem.version.version
                              ) {
                                newItem.oldVersion = false;
                              } else {
                                newItem.oldVersion = true;
                              }

                              newItem.chocoPackage = chocoItem.chocoPackage;

                              //console.log("adding package");
                              svc.data.mergedPackages.items.push(newItem);
                            }
                          }

                          if (!noticeDone && notify) {
                            PackageNotice(newItem, notifications);
                            noticeDone = true;
                          }

                          svc.data.scopePackages = $filter("filter")(
                            svc.data.mergedPackages.items,
                            svc.states.searchObj,
                            true
                          );
                        });
                      } else {
                        //console.log("could not find source!!!");
                      }
                    } else {
                      //console.log("doing nothing due to listingAllAvaliable is true")
                    }
                  } else {
                    if (
                      newItem.version.version ==
                      existingMergedPackages[0].chocoPackage.Version
                    ) {
                      //newItem.command.execLog = existingMergedPackages[0].command.execLog;
                      existingMergedPackages[0].command = newItem.command;
                      //existingMergedPackages[0].groupInfo = newItem.groupInfo;

                      if (
                        existingMergedPackages[0].chocoPackage.Version ==
                        newItem.version.version
                      ) {
                        existingMergedPackages[0].oldVersion = false;
                      } else {
                        existingMergedPackages[0].oldVersion = true;
                      }

                      //console.log("package existed " + newItem.command.status);
                      if (!noticeDone && notify) {
                        PackageNotice(existingMergedPackages[0], notifications);
                        noticeDone = true;
                      }

                      svc.data.scopePackages = $filter("filter")(
                        svc.data.mergedPackages.items,
                        svc.states.searchObj,
                        true
                      );
                    }

                    if (existingMergedPackages[0].otherVersions) {
                      var existingOtherVersionItems = $filter("filter")(
                        existingMergedPackages[0].otherVersions,
                        {
                          chocoPackage: {
                            Id: newItem.package.name,
                            Version: newItem.version.version,
                          },
                          source: {
                            uid: newItem.source.uid,
                          },
                        },
                        true
                      );

                      if (existingOtherVersionItems.length != 0) {
                        existingOtherVersionItems[0].command = newItem.command;
                        //existingOtherVersionItems[0].groupInfo = newItem.groupInfo;
                        //console.log("other version package existed " + newItem.command.status);
                      }

                      if (!noticeDone && notify) {
                        PackageNotice(
                          existingOtherVersionItems[0],
                          notifications
                        );
                        noticeDone = true;
                      }
                    } else {
                    }

                    if (!noticeDone && notify) {
                      PackageNotice(newItem, notifications);
                      noticeDone = true;
                    }
                  }
                }
              }
            });
          });

          HideLoading();
        }
      }
    }
  });
}

function GetPackageStats(groupPackages, computers, chocoItem, $filter) {
  if (chocoItem.chocoPackage) {
    const packagesToFilter = groupPackages.filter(
      (x) =>
        x.version.packageHash === chocoItem.chocoPackage.PackageHash &&
        x.source.uid === chocoItem.source.uid
    );

    const installed = packagesToFilter.filter(
      (x) => x.command.status === "done" && x.command.name !== "uninstall"
    );
    const uninstalled = packagesToFilter.filter(
      (x) => x.command.status === "done" && x.command.name === "uninstall"
    );
    const pending = packagesToFilter.filter(
      (x) => x.command.status === "pending"
    );
    const failed = packagesToFilter.filter(
      (x) => x.command.status === "failed"
    );
    const working = packagesToFilter.filter(
      (x) => x.command.status === "working"
    );

    let allDone = false;

    let procentDone = 0;
    let procentFailed = 0;
    let procentWorking = 0;
    let procentInstalled = 0;
    let procentUninstalled = 0;

    let totalDone = 0;

    let totalInstalled = 0;
    let installedComputerUIDs = [];

    let totalFailed = 0;
    let failedComputerUIDs = [];

    let totalWorking = 0;
    let workingComputerUIDs = [];

    let totalPending = 0;
    let pendingComputerUIDs = [];

    let totalUninstalled = 0;
    let uninstalledComputerUIDs = [];

    let totalNoStatus = 0;
    let noStatusComputerUIDs = [];

    let totalComputers = computers.length;

    if (installed.length > 0) {
      totalInstalled = installed.length;
      installedComputerUIDs = installed.map((package) => package.computerUID);
    }

    if (failed.length > 0) {
      totalFailed = failed.length;
      failedComputerUIDs = failed.map((package) => package.computerUID);
    }

    if (working.length > 0) {
      totalWorking = working.length;
      workingComputerUIDs = working.map((package) => package.computerUID);
    }

    if (pending.length > 0) {
      totalPending = pending.length;
      pendingComputerUIDs = pending.map((package) => package.computerUID);
    }

    if (uninstalled.length > 0) {
      totalUninstalled = uninstalled.length;
      uninstalledComputerUIDs = uninstalled.map(
        (package) => package.computerUID
      );
    }

    noStatusComputerUIDs = computers.map((x) => x.uid);

    for (const uid of installedComputerUIDs) {
      const index = noStatusComputerUIDs.indexOf(uid);
      if (index != -1) {
        noStatusComputerUIDs.splice(index, 1);
      }
    }

    for (const uid of uninstalledComputerUIDs) {
      const index = noStatusComputerUIDs.indexOf(uid);
      if (index != -1) {
        noStatusComputerUIDs.splice(index, 1);
      }
    }

    for (const uid of failedComputerUIDs) {
      const index = noStatusComputerUIDs.indexOf(uid);
      if (index != -1) {
        noStatusComputerUIDs.splice(index, 1);
      }
    }

    for (const uid of workingComputerUIDs) {
      const index = noStatusComputerUIDs.indexOf(uid);
      if (index != -1) {
        noStatusComputerUIDs.splice(index, 1);
      }
    }

    if (
      (totalInstalled === totalComputers &&
        chocoItem.command.name === "install") ||
      (totalInstalled === totalComputers &&
        chocoItem.command.name === "upgrade") ||
      (totalUninstalled === totalComputers &&
        chocoItem.command.name === "uninstall")
    ) {
      allDone = true;
    }

    if (
      chocoItem.command.name === "install" ||
      chocoItem.command.name === "upgrade"
    ) {
      totalDone = totalInstalled;
    } else if (chocoItem.command.name === "uninstall") {
      totalDone = totalUninstalled;
    }

    if (
      chocoItem.command.name === "install" ||
      chocoItem.command.name === "upgrade"
    ) {
      procentDone = (100 / totalComputers) * totalInstalled;
    } else if (chocoItem.command.name === "uninstall") {
      procentDone = (100 / totalComputers) * totalUninstalled;
    }
    procentDone = Math.round(procentDone);

    procentFailed = (100 / totalComputers) * totalFailed;
    procentFailed = Math.round(procentFailed);

    procentInstalled = procentInstalled =
      (100 / totalComputers) * totalInstalled;
    procentInstalled = Math.round(procentInstalled);

    procentUninstalled = procentUninstalled =
      (100 / totalComputers) * totalUninstalled;
    procentUninstalled = Math.round(procentUninstalled);

    procentWorking = procentWorking = (100 / totalComputers) * totalWorking;
    procentWorking = Math.round(procentWorking);

    totalNoStatus =
      totalComputers -
      totalWorking -
      totalFailed -
      totalInstalled -
      totalUninstalled;

    chocoItem.temp = {
      totalDone,
      allDone,
      procentDone,
      procentFailed,
      procentInstalled,
      procentUninstalled,
      procentWorking,
      totalComputers,
      totalInstalled,
      installedComputerUIDs,
      totalWorking,
      workingComputerUIDs,
      totalUninstalled,
      uninstalledComputerUIDs,
      totalPending,
      pendingComputerUIDs,
      totalFailed,
      failedComputerUIDs,
      totalNoStatus,
      noStatusComputerUIDs,
    };

    if (chocoItem.temp) {
      chocoItem.temp.installedComputers = GetComputersFromUIDs(
        chocoItem.temp.installedComputerUIDs,
        computers,
        $filter
      );
      chocoItem.temp.failedComputers = GetComputersFromUIDs(
        chocoItem.temp.failedComputerUIDs,
        computers,
        $filter
      );
      chocoItem.temp.workingComputers = GetComputersFromUIDs(
        chocoItem.temp.workingComputerUIDs,
        computers,
        $filter
      );
      chocoItem.temp.pendingComputers = GetComputersFromUIDs(
        chocoItem.temp.pendingComputerUIDs,
        computers,
        $filter
      );
      chocoItem.temp.uninstalledComputers = GetComputersFromUIDs(
        chocoItem.temp.uninstalledComputerUIDs,
        computers,
        $filter
      );
      chocoItem.temp.noStatusComputers = GetComputersFromUIDs(
        chocoItem.temp.noStatusComputerUIDs,
        computers,
        $filter
      );
    }
  }
}

function UpdateGroupItem(
  groupData,
  chocoPackages,
  groupComputers,
  newPackageItem,
  $filter,
  $routeParams,
  svc
) {
  var packageHash = newPackageItem.version.packageHash;
  var sourceUID = newPackageItem.source.uid;
  var packageName = newPackageItem.package.name;
  var packageVersion = newPackageItem.version.version;
  var computerUID = newPackageItem.computerUID;

  var filteredChocoPackages = chocoPackages.filter(
    (x) =>
      x.chocoPackage.Id === packageName &&
      x.chocoPackage.Version === packageVersion &&
      x.source.uid === sourceUID
  );
  var filteredComputerPackages = groupData.groupPackages.filter(
    (x) =>
      x.package.name === packageName &&
      x.version.version === packageVersion &&
      x.source.uid === sourceUID &&
      x.computerUID === ComputerUID
  );
  var filteredGroupPackages = groupData.packages.filter(
    (x) =>
      x.package.name === packageName &&
      x.version.version === packageVersion &&
      x.source.uid === sourceUID
  );

  var chocoPackage = filteredChocoPackages[0];
  var computerPackage = filteredComputerPackages[0];
  var groupPackage = filteredGroupPackages[0];

  if (!computerPackage && chocoPackage) {
  }

  if (!computerPackage) {
    groupData.groupPackages.push(newPackageItem);
  }

  if (computerPackage) {
    computerPackage.command = newPackageItem.command;
    computerPackage.version = newPackageItem.version;
    computerPackage.schedule = newPackageItem.schedule;
  }

  if (chocoPackage) {
    GetPackageStats(
      groupData.groupPackages,
      groupComputers,
      chocoPackage,
      $filter
    );
  }
}

function GetComputerStats(item, computers, $filter) {
  item.temp.installedComputers = GetComputersFromUIDs(
    item.temp.installedComputerUIDs,
    computers,
    $filter
  );
  item.temp.failedComputers = GetComputersFromUIDs(
    item.temp.failedComputerUIDs,
    computers,
    $filter
  );
  item.temp.workingComputers = GetComputersFromUIDs(
    item.temp.workingComputerUIDs,
    computers,
    $filter
  );
  item.temp.pendingComputers = GetComputersFromUIDs(
    item.temp.pendingComputerUIDs,
    computers,
    $filter
  );
  item.temp.uninstalledComputers = GetComputersFromUIDs(
    item.temp.uninstalledComputerUIDs,
    computers,
    $filter
  );

  //console.log(item.temp);

  return item;
}

function GetComputersFromUIDs(computerUIDs, groupComputers, $filter) {
  var computers = [];
  if (computerUIDs) {
    for (let computerUID of computerUIDs) {
      computers = [
        ...computers,
        ...groupComputers.filter((x) => x.uid === computerUID),
      ];
    }
  }

  return computers;
}

function MergePackage(item, chocoItem) {
  item.chocoPackage = chocoItem.chocoPackage;
  item.source = chocoItem.source;
  return item;
}

function UpdateChocoPackage(
  packages,
  mergedPackages,
  chocoItem,
  $filter,
  force,
  mergeOnlyExactVersion
) {
  if (chocoItem && chocoItem.chocoPackage) {
    let item = GetNewestPackage(packages, chocoItem, $filter, false, {
      name: "!uninstall",
    });

    if (!item) {
      item = GetNewestPackage(packages, chocoItem, $filter, false, {});
    }

    if (item) {
      item.commandName = item.command.name;

      if (chocoItem.chocoPackage.Version === item.version.version) {
        if (item.schedule.type == 1) {
          item.isAutoUpdate = true;
        } else {
          item.isAutoUpdate = false;
        }

        if (item && item.schedule && item.schedule.type == 1) {
          item.oldVersion = false;
        }

        if (item && item.version.version === chocoItem.chocoPackage.Version) {
          item.schedule = FixSchedule(item.schedule);
        } else {
          item.schedule = {};
        }

        if (item) {
          item = MergePackage(item, chocoItem);
        } else {
          item = MergePackage(item, chocoItem);
        }

        if (
          item &&
          item.version.version != item.chocoPackage.Version &&
          item.command.name !== "uninstall"
        ) {
          item.oldVersion = true;
        }

        if (
          (item.oldVersion == null &&
            item.chocoPackage.Version !== item.version.version &&
            item.command.name === "install" &&
            item.chocoPackage.IsLatestVersion) ||
          (item.oldVersion == null &&
            item.chocoPackage.Version !== item.version.version &&
            item.command.name === "upgrade" &&
            item.chocoPackage.IsLatestVersion)
        ) {
          item.oldVersion = true;
        } else if (
          item.chocoPackage.Version === item.version.version &&
          item.command.name === "uninstall"
        ) {
          if (
            item &&
            item.version.version !== item.chocoPackage.Version &&
            item.oldVersion == null
          ) {
            item.oldVersion = true;
          } else {
            item.oldVersion = false;
          }
        } else {
          if (item.oldVersion == null) {
            item.oldVersion = false;
          }
        }

        // if (
        //   (mergeOnlyExactVersion &&
        //     chocoPackage.chocoPackage &&
        //     item.version &&
        //     chocoPackage.chocoPackage.Version !== item.version.version) ||
        //   (chocoPackage.chocoPackage.Version !== item.version.version &&
        //     item.isAutoUpdate)
        // ) {
        //   item.command = {};
        //   item.version = {};
        //   item.schedule = {};
        //   item.package = {};
        // }

        mergedPackages.push(item);
        return null;
      } else {
        return item;
      }
    } else {
      mergedPackages.push(chocoItem);
      return null;
    }
  } else {
    console.log("Package was null", chocoItem);
  }
}

function GetNewestPackage(
  packages,
  item,
  $filter,
  includeAllButUF,
  customCommand
) {
  var newest = null;
  var version = "";
  var name = "";

  if (item && item.version && item.version.version) {
    version = item.version.version;
  } else if (item && item.chocoPackage.Version) {
    version = item.chocoPackage.Version;
  }

  if (item && item.package && item.package.name) {
    name = item.package.name;
  } else if (item && item.chocoPackage && item.chocoPackage.Id) {
    name = item.chocoPackage.Id;
  }

  let filtered = [];

  if (version != "" && name != "") {
    if (includeAllButUF) {
      filtered = packages.filter(
        (x) =>
          x.package.name === name &&
          x.command.name !== "uninstall" &&
          x.command.status !== "failed" &&
          x.version.version !== "" &&
          x.source.uid === item.source.uid
      );
    } else if (customCommand) {
      filtered = $filter("filter")(
        packages,
        {
          package: {
            name: name,
          },
          command: customCommand,
          version: {
            version: "!",
          },
          source: {
            uid: item.source.uid,
          },
        },
        true
      );
    } else {
      filtered = packages.filter(
        (x) =>
          x.package.name === name &&
          x.command.name === "install" &&
          x.command.status === "done" &&
          x.version.version !== "" &&
          x.source.uid === item.source.uid
      );
    }

    if (filtered && filtered.length > 0) {
      newest = filtered[0];
    }

    let i = filtered.length;
    while (i--) {
      const currItem = filtered[i];
      if (
        newest &&
        newest.version &&
        newest.version.version &&
        currItem.version &&
        currItem.version.version
      ) {
        const result = CompareVersions(
          newest.version.version,
          currItem.version.version
        );

        if (result < 0) {
          newest = currItem;
        }
      }
    }
  }

  return newest;
}

function GetDomain(domainUID, svc, $filter) {
  return new Promise((reslove) => {
    if (!svc.data.domains) {
      svc.GetDomains();
    }

    if (svc.data.domains) {
      svc.data.domains.then((res) => {
        if (res.data.length > 0) {
          var domain = res.data.find((x) => x.uid === domainUID);
          if (domain) {
            reslove(domain);
          }
        } else {
          resolve(null);
        }
      });
      // .catch(err => {
      //   ShowNotification("Could not get domains.");
      //   resolve(null);
      // });
    } else {
      resolve(null);
    }
  });
}

function GetGroupComputers(groupUID, svc, $filter, cb) {
  GetGroupItem(groupUID, svc, $filter, (currentGroupItem) => {
    if (currentGroupItem) {
      cb(currentGroupItem.computers);
    } else {
      cb(null);
    }
  });
}

function GetGroupComputersUIDs(groupUID, svc, $filter, cb) {
  GetGroupItem(groupUID, svc, $filter, (currentGroupItem) => {
    if (currentGroupItem) {
      cb(currentGroupItem.computers.map((computer) => computer.uid));
    } else {
      cb(null);
    }
  });
}

function GetGroupItem(groupUID, svc, $filter, cb) {
  if (!svc.data.groups) {
    svc.GetGroups();
  }

  if (svc.data.groups) {
    svc.data.groups.then((groupRes) => {
      var group = groupRes.data.find((x) => x.group.uid === groupUID);

      if (group) {
        cb(group);
      } else {
        cb(null);
      }
    });
  } else {
    cb(null);
  }
}

function GetNewestUpgradePackage(packages, item, $filter) {
  var filtered = packages.filter(
    (x) =>
      x.package.name === item.package.name &&
      x.command.name === "install" &&
      x.source.uid === item.source.uid
  );
  var newest = null;
  let i = filtered.length;
  while (i--) {
    const item = filtered[i];
    if (newest) {
      var result = CompareVersions(
        newest.version.version,
        item.version.version
      );
      if (result < 0) {
        newest = item;
      }
    } else {
      newest = item;
    }
  }

  return newest;
}

function UpdateComputerInfo(newComputerInfo, svc, $filter, $routeParams) {
  var computerUID = "";

  if (newComputerInfo && newComputerInfo.uid && newComputerInfo.uid != "") {
    computerUID = newComputerInfo.uid;
  } else if (
    newComputerInfo &&
    newComputerInfo.computerUID &&
    newComputerInfo.computerUID != ""
  ) {
    computerUID = newComputerInfo.computerUID;
  }

  if (!svc.data.computers) {
    svc.GetComputers();
  }

  if (computerUID && computerUID != "" && svc.data.computers) {
    svc.data.computers.then((res) => {
      if (res.data.length > 0) {
        var computers = $filter("filter")(
          res.data[0].computers,
          {
            uid: computerUID,
          },
          true
        );
        var currentComputer = computers[0];

        if (currentComputer) {
          if (
            currentComputer.friendlyName &&
            currentComputer.friendlyName != ""
          ) {
            console.log(
              "updating computer info for: " + currentComputer.friendlyName
            );
          } else {
            console.log("updating computer info for: " + currentComputer.name);
          }

          for (let property in newComputerInfo) {
            if (newComputerInfo[property] != null) {
              currentComputer[property] = newComputerInfo[property];
            }
          }

          if (newComputerInfo.systemInfo) {
            for (let property in newComputerInfo.systemInfo) {
              if (currentComputer.systemInfo.hasOwnProperty(property)) {
                if (newComputerInfo.systemInfo[property]) {
                  currentComputer.systemInfo[property] =
                    newComputerInfo.systemInfo[property];
                }
              }
            }
          }

          let computerOrder = GetSettings("computerOrder");
          if (computerOrder) {
            let orderComputersBy = computerOrder.array;
            let orderComputersReversed = computerOrder.reversed;
            res.data[0].computers = $filter("orderBy")(
              res.data[0].computers,
              orderComputersBy,
              orderComputersReversed
            );
          }
        } else {
          //svc.GetComputers();
          if (newComputerInfo.name) {
            //console.log("no computer found to update, pushing new computer");
            res.data[0].computers.push(newComputerInfo);

            if (
              svc.states.settings.profile &&
              svc.states.settings.profile.notifications &&
              svc.states.settings.profile.notifications.newComputers != null &&
              svc.states.settings.profile.notifications.newComputers === true
            ) {
              ShowNotification(
                "New computer has been added: " + newComputerInfo.name
              );
            }
          }
        }
      }
    });
  }

  if (!svc.data.groups) {
    svc.GetGroups();
  }

  svc.data.groups.then((groupRes) => {
    let i = groupRes.data.length;
    while (i--) {
      const item = groupRes.data[i];
      var currentItems = $filter("filter")(
        item.computers,
        {
          uid: newComputerInfo.uid,
        },
        true
      );
      var currentItem = currentItems[0];

      if (currentItem) {
        if (!angular.isUndefined(newComputerInfo.online)) {
          currentItem.online = newComputerInfo.online;
        }

        if (!angular.isUndefined(newComputerInfo.clientVersion)) {
          //console.log("Changing groupcomputer clientVersion: " + newComputerInfo.clientVersion);
          currentItem.clientVersion = newComputerInfo.clientVersion;
        }

        if (!angular.isUndefined(newComputerInfo.inventorying)) {
          //console.log("Changing groupcomputer inventorying: " + newComputerInfo.inventorying);
          currentItem.inventorying = newComputerInfo.inventorying;
        }
      }
    }
  });
}

function SetSearchObj($scope, svc, name, status, oldVersion, listAllAvailable) {
  $scope.searchVal = "";
  $scope.searchTemp = $scope.searchVal;
  Focus("search");

  var obj = {};
  obj.command = {};

  if (oldVersion) {
    obj.oldVersion = true;
  }

  if (name && name != "") {
    obj.command.name = name;
  }

  if (status && status != "") {
    obj.command.status = status;
  }

  if (
    ($scope.searchObj &&
      $scope.searchObj.command &&
      obj.command.name == $scope.searchObj.command.name &&
      obj.command.status == $scope.searchObj.command.status &&
      obj.oldVersion == $scope.searchObj.oldVersion) ||
    (!name && !status && !oldVersion)
  ) {
    $scope.searchObj = {};
    svc.states.searchObj = $scope.searchObj;

    $scope.GetPackages(listAllAvailable);
  } else {
    $scope.searchObj = obj;
    svc.states.searchObj = $scope.searchObj;
    $scope.GetPackages(listAllAvailable);
  }
}

function GetAllPackages(
  packages,
  svc,
  $http,
  $filter,
  $routeParams,
  $q,
  filterResult,
  matchVersion,
  skipMatchVersionIfAutoUpdate,
  isGroup
) {
  var deferred = $q.defer();

  GetMatchingChocoPackages(
    packages,
    svc,
    $http,
    $routeParams,
    $q,
    matchVersion,
    skipMatchVersionIfAutoUpdate
  ).then((chocoPackages) => {
    var currentMergedPackage = $filter("filter")(
      svc.data.mergedPackages.items,
      searchObj,
      true
    )[0];

    for (let item of packages) {
      var searchObj = {
        chocoPackage: {
          Id: item.package.name,
          Version: item.version.version,
        },
        source: {
          uid: item.source.uid,
        },
      };

      if (
        !matchVersion ||
        (skipMatchVersionIfAutoUpdate && item.schedule.type == 1)
      ) {
        matchVersion = false;
        delete searchObj.chocoPackage.Version;
      }

      var currentMergedPackage = $filter("filter")(
        svc.data.mergedPackages.items,
        searchObj,
        true
      )[0];

      if (!currentMergedPackage) {
        var currentChocoPackage = $filter("filter")(
          chocoPackages,
          searchObj,
          true
        )[0];

        let latestInstalledVersion = GetNewestPackage(
          packages,
          item,
          $filter,
          false,
          {
            name: "!uninstall",
            // status: "!failed"
          }
        );

        let latestUninstalledVersion = GetNewestPackage(
          packages,
          item,
          $filter,
          false,
          {
            name: "uninstall",
          }
        );

        if (currentChocoPackage) {
          if (isGroup) {
            //console.log(currentChocoPackage)
            if (
              (latestInstalledVersion &&
                currentChocoPackage.chocoPackage.Version ==
                  latestInstalledVersion.version.version) ||
              item.schedule.type == 1
            ) {
              UpdateChocoPackage(
                packages,
                svc.data.mergedPackages.items,
                currentChocoPackage,
                $filter,
                false,
                matchVersion
              );
            } else if (
              !latestInstalledVersion &&
              latestUninstalledVersion &&
              currentChocoPackage.chocoPackage.Version ==
                latestUninstalledVersion.version.version
            ) {
              UpdateChocoPackage(
                packages,
                svc.data.mergedPackages.items,
                currentChocoPackage,
                $filter,
                false,
                matchVersion
              );
            } else {
            }
          } else {
            if (
              latestInstalledVersion &&
              currentChocoPackage.chocoPackage.Version ==
                latestInstalledVersion.version.version
            ) {
              UpdateChocoPackage(
                packages,
                svc.data.mergedPackages.items,
                currentChocoPackage,
                $filter,
                false,
                matchVersion
              );
            } else if (
              !latestInstalledVersion &&
              latestUninstalledVersion &&
              currentChocoPackage.chocoPackage.Version ==
                latestUninstalledVersion.version.version
            ) {
              UpdateChocoPackage(
                packages,
                svc.data.mergedPackages.items,
                currentChocoPackage,
                $filter,
                false,
                matchVersion
              );
            }
          }
        } else {
          if (svc.states.notifications) {
            ShowNotification(
              "Package exist in Deployify but not in source: " +
                item.package.name +
                " " +
                item.version.version,
              null,
              "is-warning"
            );
          }
        }
      }
    }

    if (filterResult) {
      svc.data.scopePackages = $filter("filter")(
        svc.data.mergedPackages.items,
        svc.states.searchObj,
        true
      );
    }

    HideLoading();

    deferred.resolve(true);
  });

  return deferred.promise;
}

function LoadChocoPackages(
  $http,
  svc,
  $filter,
  $routeParams,
  $q,
  search,
  reload,
  isGroup,
  filterObj
) {
  var defer = $q.defer();

  //var notifications = JSON.parse(localStorage.getItem('notifications'));

  svc.data.mergedPackages.items = [];
  svc.data.scopePackages = svc.data.mergedPackages.items;

  if (isGroup) {
    svc.GetGroupPackages();
  }

  GetDomainPackageSourcesIfNess(svc, $routeParams).then(() => {
    if (!svc.data.packages) {
      svc.GetComputerPackages();
    }

    if (svc.data.packageSources) {
      GetDomain($routeParams.domainUID, svc, $filter).then(async (domain) => {
        svc.data.packageSources.then(async (sourceRes) => {
          if (reload) {
            console.log("reloading");
            svc.data.chocoPackages = null;
            for (let source of sourceRes.data) {
              if (
                (domain.shared && source.shared) ||
                (!domain.shared && !source.shared)
              ) {
                svc.GetChocoPackages(source, search);
              }
            }
          }

          let chocoItems = await GetChocoPackagesFlat(svc, $q);

          let dbItems;
          if (isGroup) {
            dbItems = (await svc.data.groupPackages).data[0];
          } else {
            dbItems = (await svc.data.packages).data[0].packages;
          }

          if (dbItems) {
            let notFound = [];
            for (let item of chocoItems) {
              let missing = UpdateChocoPackage(
                dbItems,
                svc.data.mergedPackages.items,
                item,
                $filter
              );

              if (missing) {
                notFound.push(missing);
              }
            }

            let chocoPackages = await GetMatchingChocoPackages(
              notFound,
              svc,
              $http,
              $routeParams,
              $q,
              true,
              false
            );

            for (let item of chocoPackages) {
              UpdateChocoPackage(
                notFound,
                svc.data.mergedPackages.items,
                item,
                $filter
              );
            }

            defer.resolve(true);
            HideLoading();
          } else {
            defer.resolve(true);
            HideLoading();
          }
        });
      });
    } else {
      defer.resolve(true);
      HideLoading();
    }
  });

  return defer.promise;
}

function GetChocoPackagesFlat(svc, $q) {
  var defer = $q.defer();
  var items = [];

  $q.all(svc.data.chocoPackages).then((chocoResArray) => {
    if (chocoResArray && chocoResArray.length > 0) {
      for (let chocoRes of chocoResArray) {
        //console.log("LoadChocoPackages: setting scope");
        items = items.concat(chocoRes.data.packages);
      }
    }

    defer.resolve(items);
  });

  return defer.promise;
}

function GetDomainFromUID(svc, $filter, $q, domainUID) {
  var defer = $q.defer();

  if (!svc.data.domains) {
    svc.GetDomains();
  }

  if (svc.data.domains) {
    svc.data.domains.then((domainRes) => {
      let domain = domainRes.data.find((x) => x.uid === domainUID);
      if (!domain) {
        svc.GetDomains();

        domain = domainRes.data.find((x) => x.uid === domainUID);

        if (domain) {
          defer.resolve(domain);
        }
      } else {
        defer.resolve(domain);
      }
    });
  }

  return defer.promise;
}

function GetSourceFromUID(svc, $filter, $q, sourceUID) {
  var defer = $q.defer();

  if (!svc.data.packageSources) {
    svc.GetPackageSources();
  }

  if (svc.data.packageSources) {
    svc.data.packageSources.then((sourceRes) => {
      let source = sourceRes.data.find((x) => x.uid === sourceUID);
      if (!source) {
        svc.GetPackageSources();

        source = sourceRes.data.find((x) => x.uid === sourceUID);

        if (source) {
          defer.resolve(source);
        }
      } else {
        defer.resolve(source);
      }
    });
  }

  return defer.promise;
}

function PackageNotice(item, notifications) {
  return new Promise((resolve, reject) => {
    if (notifications) {
      var name;
      var version;

      if (
        item.chocoPackage &&
        item.chocoPackage.Title &&
        item.chocoPackage.Title != ""
      ) {
        name = '"' + item.chocoPackage.Title + '"';
      } else {
        name = '"' + item.package.name + '"';
      }

      if (
        item.chocoPackage &&
        item.chocoPackage.Version &&
        item.chocoPackage.Version != ""
      ) {
        version = item.chocoPackage.Version;
      } else {
        version = item.version.version;
      }

      version = "v. " + version;

      var toastTimer = 10000;
      if (item.command.status === "done" && item.command.name === "install") {
        ShowNotification(
          "Installation for " + name + " " + version + " was successful",
          toastTimer,
          "is-success"
        );
      }

      if (item.command.status === "done" && item.command.name === "upgrade") {
        ShowNotification(
          "Upgrade for " + name + " to " + version + " was successful",
          toastTimer,
          "is-success"
        );
      } else if (
        item.command.status === "done" &&
        item.command.name === "uninstall"
      ) {
        ShowNotification(
          "Uninstallation for " + name + " " + version + " was successful",
          toastTimer,
          "is-success"
        );
      } else if (
        item.command.status === "working" &&
        item.command.name === "install"
      ) {
        ShowNotification(
          "Installation for " + name + " " + version + " has started",
          toastTimer,
          "is-info"
        );
      } else if (
        item.command.status === "working" &&
        item.command.name === "upgrade"
      ) {
        ShowNotification(
          "Upgrade for " + name + " to " + version + " has started",
          toastTimer,
          "is-info"
        );
      } else if (
        item.command.status === "working" &&
        item.command.name === "uninstall"
      ) {
        ShowNotification(
          "Uninstallation for " + name + " " + version + " has started",
          toastTimer,
          "is-info"
        );
      } else if (
        item.command.status === "failed" &&
        item.command.name === "uninstall"
      ) {
        ShowNotification(
          "Uninstallation for " + name + " " + version + " failed",
          "stay on",
          "is-danger"
        );
      } else if (
        item.command.status === "failed" &&
        item.command.name === "install"
      ) {
        ShowNotification(
          "Installation for " + name + " " + version + " failed",
          "stay on",
          "is-danger"
        );
      } else if (
        item.command.status === "failed" &&
        item.command.name === "upgrade"
      ) {
        ShowNotification(
          "Upgrade for " + name + " to " + version + " failed",
          "stay on",
          "is-danger"
        );
      }
    }
    // else if (notifications) {
    //     console.log(notifications)
    //     if (item.command.status === "failed" && item.command.name === "uninstall") {
    //         setTimeout(function () {
    //             ShowNotification("<div>Uninstallation for " + item.package.name + " " + item.version.version + " failed</div>", "stay on", 'red')
    //         }, 1000);
    //     }

    //     else if (item.command.status === "failed" && item.command.name === "install") {
    //         setTimeout(function () {
    //             ShowNotification("<div>Installation for " + item.package.name + " " + item.version.version + " failed</div>", "stay on", 'red')
    //         }, 1000);
    //     }

    //     else if (item.command.status === "failed" && item.command.name === "upgrade") {
    //         setTimeout(function () {
    //             ShowNotification("<div>Upgrade for " + item.package.name + " " + item.version.version + " failed</div>", "stay on", 'red')
    //         }, 1000);
    //     }
    // }

    resolve();
  });
}

function OrderByVersion(packages) {
  return packages.sort((b, a) => {
    return CompareVersions(a.chocoPackage.Version, b.chocoPackage.Version);
  });
}

function GetPackageInArray(packages, name, version, sourceUID, exactVersion) {
  return new Promise((reslove) => {
    var search = {};

    if (packages) {
      if (exactVersion) {
        search = {
          package: {
            name: name,
          },
          version: {
            version: version,
          },
          source: {
            uid: sourceUID,
          },
        };
      } else {
        search = {
          package: {
            name: name,
          },
          source: {
            uid: sourceUID,
          },
        };
      }

      filtered = $filter("filter")(packages, search, true);
      reslove(filtered);
    } else {
      reject();
    }
  });
}

function CompareVersions(a, b) {
  var i, diff;
  var regExStrip0 = /(\.0+)+$/;
  var segmentsA = a.replace(regExStrip0, "").split(".");
  var segmentsB = b.replace(regExStrip0, "").split(".");
  var l = Math.min(segmentsA.length, segmentsB.length);

  for (i = 0; i < l; i++) {
    diff = parseInt(segmentsA[i], 10) - parseInt(segmentsB[i], 10);
    if (diff) {
      return diff;
    }
  }
  return segmentsA.length - segmentsB.length;
}

function PrepAndConnectSocket(
  svc,
  $filter,
  $routeParams,
  $http,
  $q,
  $rootScope,
  force
) {
  return new Promise(async (resolve) => {
    if (
      socket &&
      socket.connected &&
      $routeParams.domainUID != socketDomainUID
    ) {
      socket.disconnect();
    }

    if (
      socket &&
      !socket.connected &&
      !socketConnecting &&
      $routeParams.domainUID &&
      $routeParams.domainUID != ""
    ) {
      let currentDomain;
      try {
        currentDomain = await GetDomainFromUID(
          svc,
          $filter,
          $q,
          $routeParams.domainUID
        );
      } catch (err) {
        console.error(err);
      }

      if (currentDomain) {
        console.log("Getting user token");

        let res;
        socketDomainUID = currentDomain.uid;

        try {
          res = await PostApi(svc, $http, $q, "secure/get/userSocketToken", {});
        } catch (ex) {
          console.log("Could not get user token");

          setTimeout(() => {
            PrepAndConnectSocket(
              svc,
              $filter,
              $routeParams,
              $http,
              $q,
              $rootScope
            );
          }, 5000);
        }

        if (res && res.data && res.data[0]) {
          let token = res.data[0].token;
          let sessionId = res.data[0].sessionId;
          let domainKey = currentDomain.key;
          let userUID = svc.states.user.userUID;

          try {
            socketConnecting = true;
            ConnectSocket(
              sessionId,
              token,
              domainKey,
              userUID,
              svc,
              $filter,
              $routeParams,
              $http,
              $q,
              $rootScope
            );
          } catch (err) {
            console.error(err);
          }
        }
      }

      socketConnecting = false;
    } else {
      //console.log(`socket null: ${(socket ? 'no' : 'yes')}, connected: ${socket.connected}, connecting: ${socketConnecting}, domainUID: ${$routeParams.domainUID}`);
    }
  });
}

function GetDomainPermissions() {
  return [
    {
      name: "Read",
      value: 4,
    },
    {
      name: "Execute",
      value: 8,
    },
    {
      name: "Change",
      value: 16,
    },
    {
      name: "Add",
      value: 32,
    },
    {
      name: "Remove",
      value: 64,
    },
    {
      name: "Remove domain",
      value: 128,
    },
    {
      name: "Edit shares",
      value: 256,
    },
    {
      name: "Owner",
      value: null,
    },
  ];
}

function GetSourcePermissions() {
  return [
    {
      name: "Read",
      value: 1,
    },
    {
      name: "Download",
      value: 2,
    },
    {
      name: "Update",
      value: 4,
    },
    {
      name: "Create",
      value: 8,
    },
    {
      name: "Delete",
      value: 16,
    },
    {
      name: "Owner",
      value: 32,
    },
  ];
}

function GetDomainPermissionName(permission) {
  let perm = GetDomainPermissions().find((x) => x.value === permission);
  if (perm) {
    return perm.name;
  }

  return "";
}

function GetSourcePermissionName(permission) {
  let perm = GetSourcePermissions().find((x) => x.value === permission);
  if (perm) {
    return perm.name;
  }

  return "";
}

function SaveSettings(name, value) {
  if (typeof value == "object") {
    value = JSON.stringify(value);
  }

  localStorage.setItem(name, value);
}

function GetSettings(name) {
  let setting = localStorage.getItem(name);

  if (setting) {
    if (
      setting.toString().startsWith("{") &&
      setting.toString().endsWith("}")
    ) {
      return JSON.parse(setting);
    } else {
      return setting;
    }
  }

  return;
}

function DownloadText(text) {
  window.open(
    "data:application/txt;charset=utf-8," + encodeURIComponent(text),
    "_self"
  );
}

function SendPSCommand(computerUID, command) {
  socket.emit("psCommand", { computerUID, command });
}

function RequestDpLog(computerUIDs) {
  socket.emit("command", {
    computerUIDs: computerUIDs,
    name: "request",
    eventString: "logRequest",
  });
}

function RequestInventory(computerUIDs) {
  socket.emit("command", {
    computerUIDs: computerUIDs,
    name: "request",
    data: {
      command: {
        name: "inventory",
        status: "pending",
      },
    },
    eventString: "inventoryChange",
  });
}

function RequestWOL(macAddresses) {
  socket.emit("command", {
    computerUIDs: [],
    data: {
      macAddresses: macAddresses,
    },
    name: "request",
    eventString: "WOLRequest",
  });
}

function FormSource(source, skipPackagesEnding = false) {
  if (source && source.external == false) {
    let urlToUse = "";
    if (!source.version || source.version === 1) {
      urlToUse = feedBaseUrl;
    } else {
      urlToUse = baseUrl + "feeds/";
    }

    source.url = urlToUse + source.uid + "/user/" + source.key + "/nuget/";
  }

  // if (!skipPackagesEnding) {
  //   source.url = source.url += "Packages";
  // }

  return source;
}

function ShowContextMenu(e, $scope, $compile, menu) {
  if (menu) {
    setTimeout(() => {
      temp = $compile(menu)($scope);
      angular.element(".context-menu-content").html(temp);
    }, 0);
  } else {
    angular.element(".context-menu-content").html(menu);
  }

  var windowHeight = $(window).height() / 2;
  var windowWidth = $(window).width() / 2;

  //When user click on bottom-left part of window
  if (e.clientY > windowHeight && e.clientX <= windowWidth) {
    $(".context-menu-content").css("left", e.clientX);
    $(".context-menu-content").css("bottom", $(window).height() - e.clientY);
    $(".context-menu-content").css("right", "auto");
    $(".context-menu-content").css("top", "auto");
  } else if (e.clientY > windowHeight && e.clientX > windowWidth) {
    //When user click on bottom-right part of window
    $(".context-menu-content").css("right", $(window).width() - e.clientX);
    $(".context-menu-content").css("bottom", $(window).height() - e.clientY);
    $(".context-menu-content").css("left", "auto");
    $(".context-menu-content").css("top", "auto");
  } else if (e.clientY <= windowHeight && e.clientX <= windowWidth) {
    //When user click on top-left part of window
    $(".context-menu-content").css("left", e.clientX);
    $(".context-menu-content").css("top", e.clientY);
    $(".context-menu-content").css("right", "auto");
    $(".context-menu-content").css("bottom", "auto");
  } else {
    //When user click on top-right part of window
    $(".context-menu-content").css(
      "right",
      $(window).width() - e.clientX + "px"
    );
    $(".context-menu-content").css("top", e.clientY + "px");
    $(".context-menu-content").css("left", "auto");
    $(".context-menu-content").css("bottom", "auto");
  }

  $(".context-menu-content").css("display", "block");

  function HideMenu() {
    $(".context-menu-content").css("display", "none");
    this.removeEventListener("click", HideMenu);
    document.body.removeEventListener("click", HideMenu);
    window.removeEventListener("click", HideMenu);
  }

  document.body.addEventListener("click", HideMenu);
  window.addEventListener("click", HideMenu);
}

function GetFullComputerStats(
  item,
  $scope,
  computerUIDs,
  svc,
  $filter,
  $http,
  $q,
  $routeParams,
  skipLoading,
  forceUsingChocoPackageInfo
) {
  if (!skipLoading) {
  }
  let packageHash = "";

  if (item.version && item.version.packageHash && !forceUsingChocoPackageInfo) {
    packageHash = item.version.packageHash;
  } else {
    packageHash = item.chocoPackage.PackageHash;
  }

  let promise = PostApi(svc, $http, $q, "secure/get/computerPackagesSlim", {
    packageHash: packageHash,
    computerUIDs: computerUIDs,
    domainUID: $routeParams.domainUID,
  });

  if (!svc.data.packages) {
    svc.data.packages = promise;
  }

  promise.then((newRes) => {
    svc.data.packages.then((packageRes) => {
      for (const arrayitem of newRes.data[0].packages) {
        let found = packageRes.data[0].packages.find(
          (x) =>
            x.version.packageHash === arrayitem.version.packageHash &&
            x.computerUID === arrayitem.computerUID
        );

        if (!found) {
          //console.log("filtered did not exist, pushing");
          packageRes.data[0].packages.push(arrayitem);
        }
      }
    });

    GetPackageStats(newRes.data[0].packages, $scope.computers, item, $filter);

    HideLoading();
  });
}

function OpenModal(modalName) {
  let el = document.getElementById(modalName);
  if (el) {
    el.classList.add("is-active");
  }
}

function CloseModal(modalName) {
  let el = document.getElementById(modalName);
  if (el) {
    el.classList.remove("is-active");
  }
}

function Focus(id) {
  setTimeout(function () {
    document.getElementById(id).focus();
  }, 0);
}

function FocusForm(formId, id, selectText) {
  window.setTimeout(function () {
    if (
      document.forms &&
      document.forms[formId] &&
      document.forms[formId][id]
    ) {
      document.forms[formId][id].focus();

      if (selectText) {
        document.forms[formId][id].select();
      }
    }
  }, 0);
}

var socket = {};

function ConnectSocket(
  sessionId,
  token,
  domainKey,
  userUID,
  svc,
  $filter,
  $routeParams,
  $http,
  $q,
  $rootScope
) {
  //new Promise(async () => {
  try {
    if (socket) {
      console.log("connecting");
      socket = io(baseUrl, {
        ignoreServerCertificateValidation: false,
        query: `userUID=${userUID}&sessionId=${sessionId}&token=${token}&domainKey=${domainKey}`,
        reconnection: false,
        forceNew: false,
        //reconnectionDelay: 3000
      });

      socket.on("packageChange", function (packageChange) {
        console.log("packageChange");
        //console.log(packageChange);
        UpdatePackageInfo(
          packageChange,
          svc,
          $filter,
          $routeParams,
          $q,
          true,
          $http
        );
      });

      const psStreams = [];
      socket.on("psStream", function (data) {
        if ($routeParams.computerUID === data.computerUID) {
          if (data.line.status == "end") {
            svc.data.powershell.complete = true;
            svc.data.powershell.terminating = false;
            $rootScope.$digest();
            FocusForm("commandForm", "command", true);
          } else if (data.line.status == "noperm") {
            svc.data.powershell.complete = true;
            svc.data.powershell.terminating = false;
            $rootScope.$digest();
            FocusForm("commandForm", "command", true);
            ShowNotification("Permission denied.", 0, "is-warning");
          }

          svc.data.powershell.lines.push(data.line);

          let timeout = psStreams.find((x) => x === $routeParams.computerUID);

          if (!timeout) {
            psStreams.push($routeParams.computerUID);
            setTimeout(() => {
              $rootScope.$digest();

              let el = document.getElementById("powershell");
              if (el) {
                el.scrollTop = el.scrollHeight;
              }

              psStreams.splice($routeParams.computerUID);
            }, 500);
          }
        }
      });

      socket.on("computerChange", function (computerChange) {
        console.log("computerChange");
        UpdateComputerInfo(computerChange, svc, $filter, $routeParams);
      });

      socket.on("systemInfoChange", function (systemInfoChange) {
        console.log("systemInfoChange");
        UpdateComputerInfo(systemInfoChange, svc, $filter, $routeParams);
      });

      socket.on("disconnect", function () {
        console.log("disconnected from socket");
        socketConnecting = false;

        if ($routeParams.domainUID && $routeParams.domainUID != "") {
          if ($routeParams.computerUID && $routeParams.computerUID != "") {
            svc.states.abruptConnection = true;
            ShowNotification(
              "Disconnected from server - reconnecting",
              null,
              "is-warning"
            );
            svc.states.updatePackages = true;
          } else {
            svc.states.updatePackages = false;
          }

          PrepAndConnectSocket(
            svc,
            $filter,
            $routeParams,
            $http,
            $q,
            $rootScope,
            false
          );
        }
      });

      socket.on("connect", function () {
        console.log("connected to socket");
        socketConnecting = false;

        if (svc.states.abruptConnection) {
          svc.states.abruptConnection = false;
          ShowNotification("Reconnected to server", 5000, "is-success");
        }

        if (
          svc.states.updatePackages &&
          $routeParams.computerUID &&
          $routeParams.computerUID != ""
        ) {
          svc.GetComputerPackages();
          svc.data.packages.then((packageRes) => {
            if (packageRes.data[0].packages.length != 0) {
              console.log("updating packages");
              UpdatePackageInfo(
                packageRes.data[0],
                svc,
                $filter,
                $routeParams,
                $q,
                true,
                $http,
                false
              );
            }
          });

          PostApi(svc, $http, $q, "secure/get/domainComputer", {
            domainUID: $routeParams.domainUID,
            computerUID: $routeParams.computerUID,
          }).then((res) => {
            if (res.data.length != 0 && res.data[0].length != 0) {
              console.log("updating computer");
              UpdateComputerInfo(res.data[0][0], svc, $filter, $routeParams);
            }
          });
        }
      });

      socket.on("message", function (message) {
        console.log(message);
      });
    }
  } catch (err) {
    socketConnecting = false;
  }
  //});
}
