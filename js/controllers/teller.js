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
                Teller.updateLocation(position.coords.latitude, position.coords.longitude).then(function (res) {
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

            $ionicLoading.hide();
            $scope.tellerMode = 'disabled';
            $window.localStorage.setItem('tellerMode', JSON.stringify($scope.tellerMode));
        };
    })

    .controller('TellerTransactionsCtrl', function ($scope, $window, Teller, Conversions) {
        'use strict';

        $scope.currency = JSON.parse($window.localStorage.getItem('myCurrency'));

        $scope.refreshData = function () {
            Teller.tellerTransactions($scope.currency.code).success(
                function (res) {
                    $scope.transactions = [];

                    for (var i = 0; i < res.data.results.length; i++) {
                        res.data.results[i].amount = Conversions.from_cents(res.data.results[i].amount);
                        res.data.results[i].fee = Conversions.from_cents(res.data.results[i].fee);
                        $scope.transactions.push(res.data.results[i]);
                    }
                }
            );
        }

        $scope.refreshData()
    })

    .controller('TellerViewTransactionCtrl', function ($state, $stateParams, $scope, Teller, Conversions) {
        'use strict';

        $scope.refreshData = function () {
            Teller.tellerTransaction($stateParams.id).success(
                function (res) {
                    if (res.data.count > 0) {
                        $scope.transaction = res.data.results[0];
                        $scope.transaction.amount = Conversions.from_cents($scope.transaction.amount);
                        $scope.transaction.fee = Conversions.from_cents($scope.transaction.fee);
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
            $state.go('app.teller_transactions');
        };

        $scope.refreshData()
    })

    .controller('TellerOffersCtrl', function ($scope, $window, Teller, Conversions) {
        'use strict';

        $scope.currency = JSON.parse($window.localStorage.getItem('myCurrency'));

        $scope.refreshData = function () {
            Teller.tellerOffers($scope.currency.code, "Pending").success(
                function (res) {
                    $scope.pendingOffers = [];

                    for (var i = 0; i < res.data.results.length; i++) {
                        console.log(res.data.results[i])
                        res.data.results[i].transaction.amount = Conversions.from_cents(res.data.results[i].transaction.amount);
                        res.data.results[i].transaction.fee = Conversions.from_cents(res.data.results[i].transaction.fee);
                        $scope.pendingOffers.push(res.data.results[i]);
                    }
                }
            );
            Teller.tellerOffers($scope.currency.code, "Accepted").success(
                function (res) {
                    $scope.acceptedOffers = [];

                    for (var i = 0; i < res.data.results.length; i++) {
                        console.log(res.data.results[i])
                        res.data.results[i].transaction.amount = Conversions.from_cents(res.data.results[i].transaction.amount);
                        res.data.results[i].transaction.fee = Conversions.from_cents(res.data.results[i].transaction.fee);
                        $scope.acceptedOffers.push(res.data.results[i]);
                    }
                }
            );
        }

        $scope.refreshData()
    })

    .controller('TellerCreateOfferCtrl', function ($scope, $ionicPopup, $ionicModal, $state, $stateParams, $ionicLoading, $window, Teller, Conversions) {
        'use strict';

        $scope.submit = function (form) {
            $ionicLoading.show({
                template: 'Creating...'
            });

            if (form.$valid) {
                Teller.tellerCreateOffer($stateParams.id, form.note.$viewValue).then(function (res) {
                    if (res.status === 200) {
                        $scope.offer = res.data.data;
                        $scope.offer.transaction.amount = Conversions.from_cents($scope.offer.transaction.amount);
                        $scope.offer.transaction.fee = Conversions.from_cents($scope.offer.transaction.fee);

                        $ionicLoading.hide();
                        $state.go('app.teller_offers', {
                            offer: $scope.offer
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

    .controller('TellerViewOfferCtrl', function ($scope, $ionicPopup, $ionicModal, $state, $stateParams, $ionicLoading, $window, Teller) {
        'use strict';

        $scope.offer = $stateParams.offer;

        $scope.submit = function (form) {
            if (form.$valid) {
                $ionicLoading.show({
                    template: 'Processing...'
                });
                Teller.tellerConfirmOffer($scope.offer.id, form.code.$viewValue).then(function (res) {
                    if (res.status === 200) {
                        $ionicLoading.hide();
                        $state.go('app.teller_completed_offer', {
                            offer: $scope.offer
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

        $scope.cancel = function () {
            $ionicLoading.show({
                template: 'Cancelling...'
            });

            // Cancel the offer (but leave transaction as is)
            Teller.tellerCancelOffer($scope.offer.id).then(function (res) {
                if (res.status === 200) {
                    $ionicLoading.hide();
                    $state.go('app.teller_offers');
                } else {
                    $ionicLoading.hide();
                    $ionicPopup.alert({title: "Error", template: res.data.message});
                }
            }).catch(function (error) {
                $ionicPopup.alert({title: 'Authentication failed', template: error.message});
                $ionicLoading.hide();
            });
        };
    })

    .controller('TellerHistoryCtrl', function ($scope, $window, Teller, Conversions) {

        $scope.currency = JSON.parse($window.localStorage.getItem('myCurrency'));

        $scope.refreshData = function () {
            Teller.tellerOffers($scope.currency.code).success(
                function (res) {
                    $scope.offers = [];

                    for (var i = 0; i < res.data.results.length; i++) {
                        res.data.results[i].transaction.amount = Conversions.from_cents(res.data.results[i].transaction.amount);
                        res.data.results[i].transaction.fee = Conversions.from_cents(res.data.results[i].transaction.fee);
                        $scope.offers.push(res.data.results[i]);
                    }
                }
            );
        }

        $scope.refreshData()
    })

    .controller('TellerCompletedOfferCtrl', function ($scope, $window, $state, $stateParams) {
        'use strict';

    });
