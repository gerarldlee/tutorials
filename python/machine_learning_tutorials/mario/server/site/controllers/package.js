app.controller("PackageController", ['svc', '$scope', '$rootScope', 'Upload', '$timeout', '$filter', '$routeParams', '$location', function (svc, $scope, $rootScope, Upload, $timeout, $filter, $routeParams, $location) {

    $scope.tab = 1;
    $scope.uploadToFeed = true;
    $scope.ready = false;
    let sourceUrl = "";
    let url = "";

    $scope.status = {
        uploading: false,
        processing: false,
        code: null,
        message: null,
    };

    $scope.SetReady = function (ready) {
        $scope.ready = ready;
    }

    $scope.SelectFile = function (file) {
        $scope.ext = GetFileExtension(file.name);
        $scope.file = file;

        if ($scope.ext === 'nupkg') {
            $scope.tab = 3;
        } else {
            $scope.tab = 2;
        }

        $scope.status.uploading = false
        $scope.status.processing = false
        $scope.status.code = null
        $scope.status.message = null
    }


    $scope.$on('$viewContentLoaded', function () {
        let angEl = angular.element(document.getElementById('fileInput'))

        this.setTimeout(() => {
            angEl.scope().SetReady(true);
            angEl.scope().$apply();
        }, 0)

        let el = document.getElementById("fileInput");
        el.addEventListener('change', (e) => {
            angEl.scope().SelectFile(e.target.files[0])
        }, false);
    });

    if (!svc.data.packageSources) {
        svc.GetPackageSources();
    }
    svc.data.packageSources.then(function (res) {
        var filteredSources = $filter('filter')(res.data, {
            uid: $routeParams.sourceUID
        }, true);
        if (filteredSources.length > 0 && filteredSources[0].external == false) {
            source = filteredSources[0];
            source = FormSource(source, true);
            url = source.url + "package/generate";
            $scope.source = source;
        } else {
            $scope.uploadToFeed = false;
        }
    });


    $scope.Upload = function (file) {

        if ($scope.ext == "msi") {} else if ($scope.ext == "exe") {} else if ($scope.ext == "nupkg") {
            $scope.uploadToFeed = true;
        } else {}

        if (!$scope.source.version || $scope.source.version && $scope.source.version === 1) {
            url = packageBaseUrl
        }

        var upload = Upload.upload({
            url: url,
            data: {
                file: file,
                iconUrl: $scope.iconUrl ? $scope.iconUrl : '',
                title: $scope.title ? $scope.title : '',
                id: $scope.packageId ? $scope.packageId : '',
                installArgs: $scope.installArgs ? $scope.installArgs : '',
                version: $scope.version ? $scope.version : '',
                description: $scope.description ? $scope.description : '',
                authors: $scope.authors ? $scope.authors : '',
                upload: $scope.uploadToFeed.toString(),
                source: source.url,
            },
            chunkSize: 81920,
            simultaneousUploads: 1,
        });

        upload.then(function (response) {
            $timeout(function () {
                file.result = response.data;

                $scope.status.uploading = false;
                $scope.status.processing = false;
                $scope.status.code = response.status;

                if (response.status > 0) {                    
                    if (response.data != "") {
                        $scope.status.message = response.data;
                    } else {
                        $scope.status.message = "This package should now be in \"" + $scope.source.name + "\" repo.";
                    }
                } else {
                    $scope.status.message = "Application error (package creation)";
                }
            });
        }, function (response) {

            $scope.status.uploading = false;
            $scope.status.processing = false;
            $scope.status.code = response.status;

            if (response.status > 0) {
                if (response.data != "") {
                    $scope.status.message = response.data.charAt(0).toUpperCase() + response.data.slice(1);
                } else {
                    $scope.status.message = response.data;
                }
            } else {
                $scope.status.message = "Application error (package upload)";
            }

        }, function (evt) {

            if (!$scope.status.uploading) {
                $scope.status.uploading = true;
            }

            file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            if (file.progress == 100) {
                $scope.status.uploading = false;
                $scope.status.processing = true;
            }
        });
    }

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