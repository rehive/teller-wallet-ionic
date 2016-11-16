angular.module('generic-client.controllers.deposit', [])

    .controller('DepositCtrl', function ($scope, $state, $window, $stateParams) {
        'use strict';
        $scope.items = [{'title': 'Bank Deposit', 'method': 'bank_deposit'},
            {'title': 'Teller Deposit', 'method': 'teller_deposit'}];
        var tellerBool = JSON.parse($window.localStorage.getItem('tellerBool'));

        console.log(tellerBool);

        $scope.submit = function (method) {
            if (method == 'teller_deposit') {
                if (tellerBool == 'active') {
                    $state.go('app.view_teller');
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

    .controller('SearchOffersCtrl', function ($scope, $ionicPopup, $ionicModal, $state, $ionicLoading, $window, $timeout, Teller) {
        'use strict';
        $scope.currency = JSON.parse($window.localStorage.getItem('myCurrency'));
        $scope.transaction = JSON.parse($window.localStorage.getItem('tellerTransaction'));

        var interval = setInterval(function(){
            Teller.userOffers($scope.transaction.id).then(function (res) {
                if (res.status === 200) {
                    if (res.data.data.results.length > 0) {
                        clearInterval(interval);
                        $state.go('app.select_offer');
                    }
                } else {
                    clearInterval(interval);
                    $ionicPopup.alert({title: "Error", template: res.data.message});
                }
            }).catch(function (error) {
                clearInterval(interval);
                $ionicPopup.alert({title: 'Authentication failed', template: error.message});
            });
        }, 5000);
    })

    .controller('SelectOfferCtrl', function ($scope, $state, $stateParams, $window, $ionicHistory, $ionicLoading, $cordovaGeolocation, Teller) {
        'use strict';

        $scope.data = {};
        $scope.currency = JSON.parse($window.localStorage.getItem('myCurrency'));
        $scope.transaction = JSON.parse($window.localStorage.getItem('tellerTransaction'));

        // Check for results until offers are found -> TODO update to keep checking for new offers
        var interval = setInterval(function(){
            Teller.userOffers($scope.transaction.id).then(function (res) {
                if (res.status === 200) {
                    if (res.data.data.results.length > 0) {
                        clearInterval(interval);

                        $ionicLoading.show({
                                template: 'Plotting Tellers...'
                            });

                        var options = {timeout: 5000, enableHighAccuracy: true};

                        $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
                            // Create map centred on users position
                            var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                            $window.localStorage.setItem('currentLocation', JSON.stringify(latLng));
                            $scope.map = new google.maps.Map(document.getElementById('map'), {zoom: 12, center: latLng});

                            // Lay down markers
                            for (var i = 0; i < res.data.data.results.length; i++) {
                                var id = res.data.data.results[i].id
                                var lat = res.data.data.results[i].teller_latitude
                                var lng = res.data.data.results[i].teller_longitude
                                var mlatLng = new google.maps.LatLng(lat, lng);
                                var marker = new google.maps.Marker({position: mlatLng, map: $scope.map});
                                marker.addListener('click', function () {
                                    $state.go('app.view_offer', {
                                        id: id
                                    });
                                });
                            }

                            $ionicLoading.hide();
                        }, function (error) {
                            alert("Could not get location.");
                        });
                    }
                } else {
                    clearInterval(interval);
                    $ionicPopup.alert({title: "Error", template: res.data.message});
                }
            }).catch(function (error) {
                clearInterval(interval);
                $ionicPopup.alert({title: 'Authentication failed', template: error.message});
            });
        }, 5000);

        $scope.twoBack = function () {
            $ionicHistory.goBack(-2);
        };

        $scope.refreshMap = function () {
            $window.location.reload();
        };

        $scope.submit = function (form) {
            if (form.$valid) {
                $state.go('app.select_teller');
            }
        };
    })

    .controller('ViewOfferCtrl', function ($scope, $state, $ionicPopup, $stateParams, $window, Maps, $ionicHistory, Teller) {
        'use strict';

        $scope.data = {};
        $scope.currency = JSON.parse($window.localStorage.getItem('myCurrency'));
        $scope.tellerBool = JSON.parse($window.localStorage.getItem('tellerBool'));
        $scope.latLng = JSON.parse($window.localStorage.getItem('currentLocation'));
        $scope.transaction = JSON.parse($window.localStorage.getItem('tellerTransaction'));

        Teller.userOffer($stateParams.id).then(function (res) {
            if (res.status === 200) {
                var offer = res.data.data

                var point_a = $scope.latLng;
                var center = {lat: point_a['lat'], lng: point_a['lng']};
                var point_b = {lat: offer.teller_latitude, lng: offer.teller_longitude};

                var route = {point_a: point_a, center: center, point_b: point_b};
                $window.localStorage.setItem('route', JSON.stringify(route));

                $scope.map2 = new google.maps.Map(document.getElementById('map2'), {zoom: 4, center: center});
                Maps.route($scope.map2, point_a, point_b);
            } else {
                $ionicPopup.alert({title: "Error", template: res.data.message});
            }
        }).catch(function (error) {
            $ionicPopup.alert({title: 'Authentication failed', template: error.message});
        });

        $scope.acceptDeposit = function () {
            $window.localStorage.setItem('tellerBool', JSON.stringify('active'));
            $window.location.reload();
        };

        $scope.cancelDeposit = function () {
            $window.localStorage.setItem('tellerBool', JSON.stringify('disabled'));
            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
            });
            $state.go('app.home', {});
        };
    })
