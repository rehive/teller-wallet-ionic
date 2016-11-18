angular.module('generic-client.controllers.teller', [])

    .controller('TellerCtrl', function ($scope, $ionicPopup, $ionicModal, $state, $ionicLoading, $cordovaGeolocation, $window, Teller) {
        'use strict';
        $scope.tellerMode = JSON.parse($window.localStorage.getItem('tellerMode'));

        $scope.activateTellerMode = function () {
            $ionicLoading.show({
                template: 'Activating...'
            });

            var options = {timeout: 5000, enableHighAccuracy: true};

            $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
                Teller.activate(position.coords.latitude, position.coords.longitude).then(function (res) {
                    if (res.status === 200) {
                        $ionicLoading.hide();
                        $scope.tellerMode = 'enabled';
                        $window.localStorage.setItem('tellerMode', JSON.stringify($scope.tellerMode));
                    } else {
                        $ionicLoading.hide();
                        $ionicPopup.alert({title: "Error", template: res.data.message});
                    }
                }).catch(function (error) {
                    $ionicPopup.alert({title: 'Authentication failed', template: error.data.message});
                    $ionicLoading.hide();
                });
            }, function (error) {
                alert("Could not get location.");
            });
        };

        $scope.disableTellerMode = function () {
            $ionicLoading.show({
                template: 'Deactivating...'
            });

            Teller.deactivate().then(function (res) {
                if (res.status === 200) {
                    $ionicLoading.hide();
                    $scope.tellerMode = 'disabled';
                    $window.localStorage.setItem('tellerMode', JSON.stringify($scope.tellerMode));
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
            Teller.tellerTransaction($stateParams.id).success(
                function (res) {
                    if (res.data.count > 0) {
                        $scope.transaction = res.data.results[0];
                    } else {
                        $state.go('app.teller_transactions');
                    }
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
            Teller.tellerOffers("Pending").success(
                function (res) {
                    $scope.pendingOffers = res.data.results;
                }
            );
            Teller.tellerOffers("Accepted").success(
                function (res) {
                    $scope.acceptedOffers = res.data.results;
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

    .controller('TellerConfirmOfferCtrl', function ($scope, $ionicPopup, $ionicModal, $state, $stateParams, $ionicLoading, $window, Teller) {
        'use strict';

        $scope.submit = function (form) {
            $ionicLoading.show({
                template: 'Processing...'
            });

            if (form.$valid) {
                Teller.tellerConfirmOffer($stateParams.id, form.code.$viewValue).then(function (res) {
                    if (res.status === 200) {
                        $ionicLoading.hide();
                        $state.go('app.teller_completed_offer', {
                            id: $stateParams.id
                        });
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

    .controller('TellerHistoryCtrl', function ($scope, Teller) {
        $scope.refreshData = function () {
            Teller.tellerOffers().success(
                function (res) {
                    $scope.offers = res.data.results;
                }
            );
        }

        $scope.refreshData()
    })

    .controller('TellerCompletedOfferCtrl', function ($scope, $window, $state, $stateParams) {
        'use strict';

    });
