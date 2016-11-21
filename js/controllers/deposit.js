angular.module('generic-client.controllers.deposit', [])

    .controller('DepositCtrl', function ($scope, $state, $window, $stateParams) {
        'use strict';
        $scope.items = [{'title': 'Bank Deposit', 'method': 'bank_deposit'},
            {'title': 'Teller Deposit', 'method': 'teller_deposit'}];
        var transaction = JSON.parse($window.localStorage.getItem('activeTellerDeposit'));
        var offer = JSON.parse($window.localStorage.getItem('activeTellerDepositOffer'));

        $scope.submit = function (method) {
            if (method == 'teller_deposit') {
                if (offer !== null && offer.id !== undefined) {
                    $state.go('app.view_offer', {
                        offer: offer
                    });
                } else if (transaction !== null && transaction.id !== undefined) {
                    $state.go('app.search_offers', {
                        transaction: transaction
                    });
                } else {
                    $state.go('app.deposit_amount', {
                        transaction: transaction
                    });
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

                Teller.deposit(Conversions.to_cents(amount), Conversions.to_cents(fee), $scope.currency).then(function (res) {
                    if (res.status === 200) {
                        $window.localStorage.setItem('activeTellerDeposit', JSON.stringify(res.data.data));
                        $ionicLoading.hide();

                        $state.go('app.search_offers',{
                            transaction: res.data.data
                        });
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

    .controller('SearchOffersCtrl', function ($scope, $stateParams, $ionicPopup, $ionicModal, $state, $ionicLoading, $window, $interval, Teller) {
        'use strict';
        $scope.transaction = $stateParams.transaction

        // Trigger search on page load
        search();

        // Trigger search every 5 seconds
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
                        $state.go('app.select_offer', {
                            transaction: $scope.transaction
                        });
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
        $scope.transaction = $stateParams.transaction
        $scope.map = new google.maps.Map(document.getElementById('map'), {zoom: 12});
        $scope.mappedOffers = []

        var options = {timeout: 5000, enableHighAccuracy: true};

        $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
            var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            Teller.updateLocation(position.coords.latitude, position.coords.longitude).then(function (res) {
                if (res.status !== 200) {
                    $ionicPopup.alert({title: "Error", template: res.data.message});
                }
            }).catch(function (error) {
                $ionicPopup.alert({title: 'Authentication failed', template: error.data.message});
            });

            $scope.map.setCenter(latLng);

            // Trigger search on page load
            search();

            // Trigger search every 5 seconds
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
                                    offer: offer
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

    .controller('ViewOfferCtrl', function ($scope, $state, $ionicPopup, $ionicLoading, $stateParams, $window, Maps, $cordovaGeolocation, $ionicHistory, $interval, Teller) {
        'use strict';

        $scope.data = {};
        $scope.offer = $stateParams.offer

        // Get offer
        // --------------------------------------------------

        var options = {timeout: 5000, enableHighAccuracy: true};

        $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
            $scope.latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            Teller.updateLocation(position.coords.latitude, position.coords.longitude).then(function (res) {
                if (res.status !== 200) {
                    $ionicPopup.alert({title: "Error", template: res.data.message});
                }
            }).catch(function (error) {
                $ionicPopup.alert({title: 'Authentication failed', template: error.data.message});
            });

            Teller.userOffer($scope.offer.id).then(function (res) {
                if (res.status === 200) {
                    var offer = res.data.data
                    $scope.offer = offer;

                    if ($scope.offer.status === "Confirmed") {
                        $state.go('app.view_completed_offer', {
                            offer: $scope.offer
                        });
                    } else if (offer.status === "Cancelled") {
                        $state.go('app.view_canclled_offer', {
                            id: $scope.offer
                        });
                    }

                    var point_a = $scope.latLng;
                    var center = $scope.latLng;
                    var point_b = new google.maps.LatLng($scope.offer.teller_latitude, $scope.offer.teller_longitude);

                    var route = {point_a: point_a, center: center, point_b: point_b};

                    $scope.map2 = new google.maps.Map(document.getElementById('map2'), {zoom: 4, center: center});
                    Maps.route($scope.map2, point_a, point_b);
                } else {
                    $ionicPopup.alert({title: "Error", template: res.data.message});
                }
            }).catch(function (error) {
                $ionicPopup.alert({title: 'Authentication failed', template: error.message});
            });
        }, function (error) {
            $ionicPopup.alert({title: "Error", template: "Could not get location."});
        });

        // --------------------------------------------------


        // Automatic check for completed transactions/offers
        // --------------------------------------------------

        // Every 5 seconds
        $scope.stop = $interval(checkOfferStatus, 5000);

        var dereg = $scope.$on('$destroy', function() {
            $interval.cancel($scope.stop);
            dereg();
        });

        function checkOfferStatus() {
            Teller.userOffer($scope.offer.id).then(function (res) {
                if (res.status === 200) {
                    $scope.offer = res.data.data

                    if ($scope.offer.status === "Confirmed") {
                        $state.go('app.view_completed_offer', {
                            id: $scope.offer.id
                        });
                    } else if ($scope.offer.status === "Cancelled") {
                        $state.go('app.view_cancelled_offer', {
                            id: $scope.offer.id
                        });
                    }
                }
            }).catch(function (error) {
                $interval.cancel($scope.stop);
                $ionicPopup.alert({title: 'Authentication failed', template: error.message});
            });
        }

        // --------------------------------------------------

        $scope.accept = function () {
            $ionicLoading.show({
                template: 'Accepting...'
            });

            Teller.userAcceptOffer($scope.offer.id).then(function (res) {
                if (res.status === 200) {
                    $scope.offer = res.data.data
                    $window.localStorage.setItem('activeTellerDepositOffer', JSON.stringify(res.data.data));
                    $ionicLoading.hide();
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

    .controller('ViewCompletedOfferCtrl', function ($scope, $window, $state, $stateParams) {
        'use strict';

        $scope.offer = $stateParams.offer;
        $window.localStorage.removeItem('activeTellerDeposit');
        $window.localStorage.removeItem('activeTellerDepositOffer');
    })

    .controller('ViewCancelledOfferCtrl', function ($scope, $window, $state, $stateParams) {
        'use strict';

        $scope.offer = $stateParams.offer;
        $window.localStorage.removeItem('activeTellerDeposit');
        $window.localStorage.removeItem('activeTellerDepositOffer');
    });
