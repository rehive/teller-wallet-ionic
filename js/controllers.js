angular.module('generic-client.controllers', [])

    .controller('AppCtrl', function ($state, $rootScope, $scope, Upload, Auth, API, $ionicLoading, $ionicPopup, $cordovaFileTransfer, $cordovaCamera) {

        $scope.getFile = function () {
            'use strict';
            if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
                document.addEventListener("deviceready", function () {
                    var cameraOptions = {
                        quality: 75,
                        destinationType: Camera.DestinationType.DATA_URL,
                        sourceType: Camera.PictureSourceType.CAMERA,
                        allowEdit: true,
                        encodingType: Camera.EncodingType.JPEG,
                        popoverOptions: CameraPopoverOptions,
                        saveToPhotoAlbum: true
                    };

                    $cordovaCamera.getPicture(cameraOptions).then(function (file) {
                        $scope.upload(file)
                    });
                }, false);
            } else {
                document.getElementById('upload').click();
            }
        };

        $scope.upload = function (file) {
            if (file) {
                Upload.upload({
                    url: API + "/users/profile/",
                    data: {profile: file},
                    headers: {'Authorization': 'JWT ' + Auth.getToken()},
                    method: "PUT"
                }).then(function (res) {
                    $rootScope.user.profile = res.data.data.profile;
                    $ionicLoading.hide();
                    $ionicPopup.alert({title: "Success", template: "Upload complete."});
                }, function (res) {
                    $ionicLoading.hide();
                    $ionicPopup.alert({title: "Error", template: "There was an error uploading the file."});
                }, function (evt) {
                    $ionicLoading.show({
                        template: 'Uploading...'
                    });
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                });
            }
        };

    });
