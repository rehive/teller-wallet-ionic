angular.module('generic-client.controllers.deposit', [])

    .controller('DepositCtrl', function ($scope, $state, $window, $stateParams) {
        'use strict';
        $scope.items = [{'title': 'Bank Deposit', 'method': 'bank_deposit'},
            {'title': 'Teller Deposit', 'method': 'teller_deposit'}];
        var offer = JSON.parse($window.localStorage.getItem('tellerOffer'));
        var transaction = JSON.parse($window.localStorage.getItem('tellerTransaction'));

        $scope.submit = function (method) {
            if (method == 'teller_deposit') {
                if (offer !== null && offer.id !== undefined) {
                    $state.go('app.view_offer', {
                        id: offer.id
                    });
                } else if (transaction !== null && transaction.id !== undefined) {
                    $state.go('app.search_offers');
                } else {
                    $state.go('app.deposit_amount');
                }
            }
            else if (method == 'bank_deposit') {
                $state.go('app.bank_deposit');
            }
        };
    })

    .controller('BankDepositCtrl', function ($scope, DepositDetails, TokenInfo) {
        'use strict';
        $scope.refreshDepositData = function () {
            var getDepositDetails = DepositDetails.get();

            getDepositDetails.success(
                function (res) {
                    $scope.items = res.data;
                    $scope.reference = res.data[0].reference;
                }
            );

            getDepositDetails.catch(function (error) {

            });
        };

        $scope.refreshTokenInfo = function () {
            var getTokenInfo = TokenInfo.get();

            getTokenInfo.success(
                function (res) {
                    $scope.token = res.data;
                }
            );

            getTokenInfo.catch(function (error) {

            });
        };

        $scope.$on('$ionicView.afterEnter', function () {
            $scope.refreshDepositData();
            $scope.refreshTokenInfo();
        });

    })

    .controller('DepositAmountCtrl', function ($scope, $ionicPopup, $ionicModal, $state, $ionicLoading, $window, Teller, Conversions) {
        'use strict';

        $scope.data = {};
        $scope.currency = JSON.parse($window.localStorage.getItem('myCurrency'));

        $scope.submit = function (form) {
            if (form.$valid) {
                if (form.fee.$viewValue == null) {
                    $scope.fee = 0
                } else {
                    $scope.fee = form.fee.$viewValue
                }

                var amount = parseFloat(form.amount.$viewValue);
                var fee = parseFloat(form.fee.$viewValue);

                Teller.deposit(Conversions.to_cents(amount), fee, $scope.currency).then(function (res) {
                    if (res.status === 200) {
                        $ionicLoading.hide();
                        $window.localStorage.setItem('tellerTransaction', JSON.stringify(res.data.data));
                        $state.go('app.search_offers');
                    } else {
                        $ionicLoading.hide();
                        $ionicPopup.alert({title: "Error", template: res.data.message});
                    }
                }).catch(function (error) {
                    $ionicPopup.alert({title: 'Authentication failed', template: error.message});
                    $ionicLoading.hide();
                });
            }
        };
    })

    .controller('SearchOffersCtrl', function ($scope, $ionicPopup, $ionicModal, $state, $ionicLoading, $window, $interval, Teller) {
        'use strict';
        $scope.currency = JSON.parse($window.localStorage.getItem('myCurrency'));
        $scope.transaction = JSON.parse($window.localStorage.getItem('tellerTransaction'));

        $scope.stop = $interval(search, 5000);

        var dereg = $scope.$on('$destroy', function() {
            $interval.cancel($scope.stop);
            dereg();
        });

        function search() {
            Teller.userOffers($scope.transaction.id).then(function (res) {
                if (res.status === 200) {
                    if (res.data.data.count > 0) {
                        $interval.cancel($scope.stop);
                        $state.go('app.select_offer');
                    }
                } else {
                    $interval.cancel($scope.stop);
                    $ionicPopup.alert({title: "Error", template: res.data.message});
                }
            }).catch(function (error) {
                $interval.cancel($scope.stop);
                $ionicPopup.alert({title: 'Authentication failed', template: error.message});
            });
        }
    })

    .controller('SelectOfferCtrl', function ($scope, $state, $stateParams, $window, $ionicHistory, $ionicLoading, $cordovaGeolocation, $interval, Teller) {
        'use strict';

        $scope.data = {};
        $scope.currency = JSON.parse($window.localStorage.getItem('myCurrency'));
        $scope.transaction = JSON.parse($window.localStorage.getItem('tellerTransaction'));
        $scope.map = new google.maps.Map(document.getElementById('map'), {zoom: 12});
        $scope.mappedOffers = []

        var options = {timeout: 5000, enableHighAccuracy: true};

        $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
            var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            $window.localStorage.setItem('currentLocation', JSON.stringify(latLng));

            $scope.map.setCenter(latLng);

            $scope.stop = $interval(search, 5000);

            var dereg = $scope.$on('$destroy', function() {
                $interval.cancel($scope.stop);
                dereg();
            });
        }, function (error) {
            $ionicPopup.alert({title: "Error", template: "Could not get location."});
        });

        function search() {
            Teller.userOffers($scope.transaction.id).then(function (res) {
                if (res.status === 200) {
                    for (var i = 0; i < res.data.data.results.length; i++) {
                        var offer = res.data.data.results[i]

                        if ($scope.mappedOffers.indexOf(offer.id) < 0) {
                            var mlatLng = new google.maps.LatLng(offer.teller_latitude, offer.teller_longitude);
                            var marker = new google.maps.Marker({position: mlatLng, map: $scope.map});

                            marker.addListener('click', function () {
                                $state.go('app.view_offer', {
                                    id: offer.id
                                });
                            });

                            $scope.mappedOffers.push(offer.id);
                        }
                    }
                } else {
                    $interval.cancel($scope.stop);
                    $ionicPopup.alert({title: "Error", template: res.data.message});
                }
            }).catch(function (error) {
                $interval.cancel($scope.stop);
                $ionicPopup.alert({title: 'Authentication failed', template: error.message});
            });
        }

        $scope.twoBack = function () {
            $ionicHistory.goBack(-2);
        };

        $scope.submit = function (form) {
            if (form.$valid) {
                $state.go('app.select_teller');
            }
        };
    })

    .controller('ViewOfferCtrl', function ($scope, $state, $ionicPopup, $ionicLoading, $stateParams, $window, Maps, $ionicHistory, Teller) {
        'use strict';

        $scope.data = {};
        $scope.currency = JSON.parse($window.localStorage.getItem('myCurrency'));
        $scope.latLng = JSON.parse($window.localStorage.getItem('currentLocation'));
        $scope.offer = JSON.parse($window.localStorage.getItem('tellerOffer'));
        $scope.transaction = JSON.parse($window.localStorage.getItem('tellerTransaction'));

        Teller.userOffer($stateParams.id).then(function (res) {
            if (res.status === 200) {
                var offer = res.data.data
                $scope.offer = offer;

                var point_a = $scope.latLng;
                var center = $scope.latLng;
                var point_b = {lat: offer.teller_latitude, lng: offer.teller_longitude};

                var route = {point_a: point_a, center: center, point_b: point_b};

                $scope.map2 = new google.maps.Map(document.getElementById('map2'), {zoom: 4, center: center});
                Maps.route($scope.map2, point_a, point_b);
            } else {
                $ionicPopup.alert({title: "Error", template: res.data.message});
            }
        }).catch(function (error) {
            $ionicPopup.alert({title: 'Authentication failed', template: error.message});
        });

        $scope.accept = function () {
            $ionicLoading.show({
                template: 'Accepting...'
            });

            Teller.userAcceptOffer($stateParams.id).then(function (res) {
                if (res.status === 200) {
                    var offer = res.data.data
                    $window.localStorage.setItem('tellerOffer', JSON.stringify(offer));

                    // TO DO :
                    // Update to show different page if `tellerOffer` is set
                    // Accept button should not be present/replace with cancel button

                    // Handle post accept/confirm

                } else {
                    $ionicLoading.hide();
                    $ionicPopup.alert({title: "Error", template: res.data.message});
                }
            }).catch(function (error) {
                $ionicLoading.hide();
                $ionicPopup.alert({title: 'Authentication failed', template: error.message});
            });
        };

        $scope.cancel = function () {
            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
            });
            $state.go('app.home', {});
        };
    })
