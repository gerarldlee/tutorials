app.controller("ProfileController", ["$scope", '$http', '$q', 'svc', '$location', function ($scope, $http, $q, svc, $location) {

    HideLoading();

    $scope.user = svc.states.user;
    $scope.twoFactorAuthEnabled = svc.states.serverSettings.twoFactorAuthEnabled;


    $scope.ChangePassword = function (oldPassword, newPassword) {

        PostApi(svc, $http, $q, 'secure/changepassword', {
            oldPassword: oldPassword,
            newPassword: newPassword
        }).then((res) => {
            ShowNotification("Done!", 3000, "is-success");
            $scope.showChangePassword = false;
            $scope.oldPassword = null;
            $scope.password = null;
            $scope.passwordRepeat = null;
            CloseModal('PasswordModal')
        }).catch((err) => {
            if (err.status == 403) {
                $scope.oldPassword = "";
                ShowNotification("Old password is wrong. Try again.", 3000, "is-warning");
            } else if (err.status == 500) {
                ShowNotification("Internal server error, please try again later.", null, "is-danger");
            } else if (err.status == 400) {
                ShowNotification("Missing parameter.", 5000, "is-warning");
            }

        });
    }

    $scope.settings = {
        notifications: {},
        infobar: {}
    };

    PostApi(svc, $http, $q, "secure/sessions", {}).then(result => {
        $scope.sessions = result.data[0];
    });

    $scope.EndSession = function (session) {
        session.isLoading = true;
        PostApi(svc, $http, $q, "secure/logout/session", {
            id: session.id
        }).then(result => {
            $scope.sessions.splice($scope.sessions.indexOf(session), 1);
            session.isLoading = false;
        });
    }

    GetSiteSetting("profile", svc, $q, $http).then(setting => {
        if (setting) {
            for (let prop in setting) {
                $scope.settings[prop] = setting[prop];
            }
        }
    });


    $scope.SaveSettings = function () {
        SaveSiteSettings("profile", $scope.settings, svc, $q, $http).then(() => {
            ShowNotification("Saved.", 2000, "is-success");
        });
    }

    $scope.OpenModal = function (modalName) {
        OpenModal(modalName);
    }

    $scope.CloseModal = function (modalName) {
        CloseModal(modalName);
    }

    $scope.Goto = function (event) {
        event.preventDefault();
        Goto($location, event.currentTarget.pathname)
    };

    $scope.FocusForm = function (form, id) {
        FocusForm(form, id);
    };

    $scope.TimeActive = function (date) {
        if (date && date != "") {
            date = ConvertToDate(date);
            return TimeBetweenDates(date, new Date());
        }
    }

    $scope.$on('$viewContentLoaded', function (event) {
        FP.getPromise().then((components) => {
            var values = components.map(component => {
                return component.value;
            });
            var hash = FP.x64hash128(values.join(''));
            $scope.fp = hash;
            $scope.firstLoad = false;
            $scope.$digest();
            FocusForm("loginForm", "mail");
        });
    });

}]);
