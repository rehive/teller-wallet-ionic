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

    .controller('TellerTransactionsCtrl', function ($scope, Teller) {
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

    .controller('TellerViewTransactionCtrl', function ($state, $stateParams, $scope, Teller) {
        'use strict';

        $scope.refreshData = function () {
            Teller.tellerOffer($stateParams.id).success(
                function (res) {
                    $scope.offer = res.data;
                }
            );
        }

        $scope.acceptTransaction = function () {
            $state.go('app.teller_create_offer', {
                id: $stateParams.id
            });
        };

        $scope.declineTransaction = function () {
            $state.go('app.teller');
        };

        $scope.refreshData()
    })

    .controller('TellerOffersCtrl', function ($scope, Teller) {
        'use strict';

        $scope.refreshData = function () {
            Teller.tellerOffers().success(
                function (res) {
                    $scope.offers = res.data.results;
                }
            );
        }

        $scope.refreshData()
    })

    .controller('TellerCreateOfferCtrl', function ($scope, $ionicPopup, $ionicModal, $state, $stateParams, $ionicLoading, $window, Teller) {
        'use strict';

        $scope.submit = function (form) {
            $ionicLoading.show({
                template: 'Creating...'
            });

            if (form.$valid) {
                Teller.tellerCreateOffer($stateParams.id, form.fee.$viewValue, form.note.$viewValue).then(function (res) {
                    if (res.status === 200) {
                        $ionicLoading.hide();
                        $state.go('app.teller_offers');
                    } else {
                        $ionicLoading.hide();
                        $ionicPopup.alert({title: "Error", template: res.data.message});
                    }
                }).catch(function (error) {
                    $ionicPopup.alert({title: 'Authentication failed', template: error.data.message});
                    $ionicLoading.hide();
                });
            }
        };
    })

    .controller('TellerConfirmOffersCtrl', function ($scope, $ionicPopup, $ionicModal, $state, $stateParams, $ionicLoading, $window, Teller) {
        'use strict';

        $scope.submit = function (form) {
            $ionicLoading.show({
                template: 'Processing...'
            });

            if (form.$valid) {
                Teller.tellerConfirmOffer($stateParams.id, form.code.$viewValue).then(function (res) {
                    if (res.status === 200) {
                        $ionicLoading.hide();
                        $state.go('app.teller');
                    } else {
                        $ionicLoading.hide();
                        $ionicPopup.alert({title: "Error", template: res.data.message});
                    }
                }).catch(function (error) {
                    $ionicPopup.alert({title: 'Authentication failed', template: error.data.message});
                    $ionicLoading.hide();
                });
            }
        };
    })

    .controller('TellerHistoryCtrl', function () {
        'use strict';
    });