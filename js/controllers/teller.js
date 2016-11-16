angular.module('generic-client.controllers.teller', [])

    .controller('TellerCtrl', function ($scope, $ionicPopup, $ionicModal, $state, $ionicLoading, $window, Teller) {
        'use strict';
        $scope.data = {};

        $scope.activateTellerMode = function () {
            $ionicLoading.show({
                template: 'Activating...'
            });

            Teller.activate().then(function (res) {
                if (res.status === 200) {
                    $ionicLoading.hide();
                    $window.localStorage.setItem('tellerMode', JSON.stringify('active'));
                    $window.location.reload();
                } else {
                    $ionicLoading.hide();
                    $ionicPopup.alert({title: "Error", template: res.data.message});
                }
            }).catch(function (error) {
                $ionicPopup.alert({title: 'Authentication failed', template: error.data.message});
                $ionicLoading.hide();
            });
        };

        $scope.disableTellerMode = function () {
            $ionicLoading.show({
                template: 'Deactivating...'
            });

            Teller.activate().then(function (res) {
                if (res.status === 200) {
                    $ionicLoading.hide();
                    $window.localStorage.setItem('tellerMode', JSON.stringify('disabled'));
                    $window.location.reload();
                } else {
                    $ionicLoading.hide();
                    $ionicPopup.alert({title: "Error", template: res.data.message});
                }
            }).catch(function (error) {
                $ionicPopup.alert({title: 'Authentication failed', template: error.data.message});
                $ionicLoading.hide();
            });
        };
    })

    .controller('TellerProcessCtrl', function ($scope, $state, Teller) {
        'use strict';

        $scope.submit = function (form) {
            if (form.$valid) {
                $state.go('app.teller_confirm');
            }
        };

    })

    .controller('TellerConfirmCtrl', function ($scope, $state, Teller) {
        'use strict';

        $scope.submit = function () {
            $state.go('app.teller_success');
        };

    })

    .controller('TellerSuccessCtrl', function ($scope, $state, Teller) {
        'use strict';
    })

    .controller('TellerRequestsCtrl', function ($scope, Teller) {
        'use strict';

        $scope.refreshData = function () {
            Teller.tellerTransactions().success(
                function (res) {
                    $scope.transactions = res.data.results;
                }
            );
        }

        $scope.refreshData()
    })

    .controller('TellerViewRequestCtrl', function ($state, $scope, Teller) {
        'use strict';

        $scope.acceptRequest = function () {
            $state.go('app.teller_requests');
        };

        $scope.declineRequest = function () {
            $state.go('app.teller_requests');
        };

    })


    .controller('TellerMatchesCtrl', function ($scope) {
        'use strict';

        $scope.deposits = [{
            'request': 'Earn $2.00 for $100.00 deposit.', 'distance': 'Mark Riley is 20 minutes away.'
        }];
    })

    .controller('TellerHistoryCtrl', function () {
        'use strict';
    });