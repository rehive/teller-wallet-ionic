angular.module('generic-client.controllers.teller', [])

    .controller('TellerUserWithdrawAmountCtrl', function ($scope, $ionicPopup, $ionicModal, $state, $ionicLoading, $window, $translate, Teller, Conversions) {
        'use strict';

        $scope.data = {};
        $scope.currency = JSON.parse($window.localStorage.getItem('myCurrency'));

        $scope.submit = function (form) {
            if (form.$valid) {
                $ionicLoading.show({
                    template: $translate.instant("LOADER_PROCESSING")
                });

                if (form.fee.$viewValue == null) {
                    $scope.fee = 0
                } else {
                    $scope.fee = form.fee.$viewValue
                }

                var amount = Conversions.to_cents(parseFloat(form.amount.$viewValue));
                var fee = Conversions.to_cents(parseFloat(form.fee.$viewValue));

                Teller.withdraw(amount, fee, $scope.currency.code).then(function (res) {
                    if (res.status === 200) {
                        $scope.transaction = res.data.data

                        $scope.transaction.total = Conversions.from_cents($scope.transaction.amount + $scope.transaction.fee)
                        $scope.transaction.amount = Conversions.from_cents($scope.transaction.amount)
                        $scope.transaction.fee = Conversions.from_cents($scope.transaction.fee)

                        $window.localStorage.setItem('activeTellerWithdraw', JSON.stringify($scope.transaction));
                        $ionicLoading.hide();

                        $state.go('app.teller_user_search_offers', {
                            transaction: res.data.data
                        });
                    } else {
                        $ionicLoading.hide();
                        $ionicPopup.alert({title: $translate.instant("ERROR"), template: res.data.data.join(", ")});
                    }
                }).catch(function (error) {
                    $ionicPopup.alert({title: $translate.instant("AUTHENTICATION_ERROR"), template: error.message});
                    $ionicLoading.hide();
                });
            }
        };
    })

    .controller('TellerUserDepositAmountCtrl', function ($scope, $ionicPopup, $ionicModal, $state, $ionicLoading, $window, $translate, Teller, Conversions) {
        'use strict';

        $scope.data = {};
        $scope.currency = JSON.parse($window.localStorage.getItem('myCurrency'));

        $scope.submit = function (form) {
            if (form.$valid) {
                $ionicLoading.show({
                    template: $translate.instant("LOADER_PROCESSING")
                });

                if (form.fee.$viewValue == null) {
                    $scope.fee = 0
                } else {
                    $scope.fee = form.fee.$viewValue
                }

                var amount = Conversions.to_cents(parseFloat(form.amount.$viewValue));
                var fee = Conversions.to_cents(parseFloat(form.fee.$viewValue));

                Teller.deposit(amount, fee, $scope.currency.code).then(function (res) {
                    if (res.status === 200) {
                        $scope.transaction = res.data.data

                        $scope.transaction.total = Conversions.from_cents($scope.transaction.amount + $scope.transaction.fee)
                        $scope.transaction.amount = Conversions.from_cents($scope.transaction.amount)
                        $scope.transaction.fee = Conversions.from_cents($scope.transaction.fee)

                        $window.localStorage.setItem('activeTellerDeposit', JSON.stringify($scope.transaction));
                        $ionicLoading.hide();

                        $state.go('app.teller_user_search_offers', {
                            transaction: res.data.data
                        });
                    } else {
                        $ionicLoading.hide();
                        $ionicPopup.alert({title: $translate.instant("ERROR"), template: res.data.data.join(", ")});
                    }
                }).catch(function (error) {
                    $ionicPopup.alert({title: $translate.instant("AUTHENTICATION_ERROR"), template: error.message});
                    $ionicLoading.hide();
                });
            }
        };
    })

    .controller('TellerUserSearchOffersCtrl', function ($ionicPlatform, $scope, $rootScope, $state, $stateParams, $window, $ionicHistory, $ionicPopup, $ionicLoading, $cordovaGeolocation, $interval, $timeout, $translate, Teller) {
        'use strict';

        $scope.offers = false;
        $scope.transaction = $stateParams.transaction;
        $scope.currency = JSON.parse($window.localStorage.getItem('myCurrency'));
        $scope.map = new google.maps.Map(document.getElementById('map'), {zoom: 13});
        $scope.mappedOffers = [];

        var options = {timeout: 5000, enableHighAccuracy: true};

        $ionicPlatform.ready(function () {
            $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
                var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                $scope.map.setCenter(latLng);

                var pMarker = new google.maps.Marker({
                    position: latLng,
                    title: $translate.instant("POSITION_TEXT"),
                    map: $scope.map,
                    icon: 'img/light_blue_map_marker.png',
                    zIndex: 1
                });

                Teller.updateLocation(position.coords.latitude, position.coords.longitude).then(function (res) {
                    if (res.status !== 200) {
                        $ionicPopup.alert({title: $translate.instant("ERROR"), template: res.data.message});
                    }
                }).catch(function (error) {
                    $ionicPopup.alert({title: $translate.instant("AUTHENTICATION_ERROR"), template: error.message});
                });

                // Trigger search on page load
                search();

                // Trigger search every 5 seconds
                $scope.interval = $interval(search, 5000);

                // Stop search after 60 seconds
                $scope.timeout = $timeout(function () {
                    if ($scope.mappedOffers.length === 0) {
                        $scope.cancel($translate.instant("NO_RESULTS_ERROR"), $translate.instant("NO_OFFERS_ERROR"));
                    }
                }, 60000);

                // Stop interval/timeout functions on page change
                var dereg = $scope.$on('$destroy', function () {
                    $interval.cancel($scope.interval);
                    $timeout.cancel($scope.timeout);
                    dereg();
                });
            }, function (error) {
                $ionicPopup.alert({title: $translate.instant("ERROR"), template: $translate.instant("LOCATION_ERROR")});
            });
        });

        function search() {
            Teller.userOffers($scope.transaction.id).then(function (res) {
                if (res.status === 200) {
                    for (var i = 0; i < res.data.data.results.length; i++) {
                        $scope.offers = true;

                        var offer = res.data.data.results[i]

                        if ($scope.mappedOffers.indexOf(offer.id) < 0) {
                            var mlatLng = new google.maps.LatLng(offer.user.latitude, offer.user.longitude);
                            var marker = new google.maps.Marker({position: mlatLng, map: $scope.map});

                            marker.addListener('click', function () {
                                $state.go('app.teller_user_view_offer', {
                                    offer: offer
                                });
                            });

                            $scope.mappedOffers.push(offer.id);
                        }
                    }
                } else {
                    $interval.cancel($scope.stop);
                    $ionicPopup.alert({title: $translate.instant("ERROR"), template: res.data.data.join(", ")});
                }
            }).catch(function (error) {
                $interval.cancel($scope.stop);
                $ionicPopup.alert({title: $translate.instant("AUTHENTICATION_ERROR"), template: error.message});
            });
        }

        $scope.back = function () {
            if ($scope.transaction.tx_type == 'deposit') {
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                $state.go('app.deposit');
            } else if ($scope.transaction.tx_type == 'withdraw') {
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                $state.go('app.withdraw');
            }
        }

        $scope.cancel = function (title, message) {
            $ionicLoading.show({
                template: $translate.instant("LOADER_CANCELLING")
            });

            // Cancel the transaction and any related offers
            Teller.userCancelTransaction($scope.transaction.id).then(function (res) {
                if (res.status === 200) {
                    if ($scope.transaction.tx_type == "withdraw") {
                        $window.localStorage.removeItem('activeTellerWithdraw');
                        $window.localStorage.removeItem('activeTellerWithdrawOffer');
                    } else if ($scope.transaction.tx_type == "deposit") {
                        $window.localStorage.removeItem('activeTellerDeposit');
                        $window.localStorage.removeItem('activeTellerDepositOffer');
                    }

                    if (title !== null && message !== null) {
                        $ionicPopup.alert({title: title, template: message});
                    }

                    $ionicLoading.hide();
                    $rootScope.close();
                } else {
                    $ionicLoading.hide();
                    $ionicPopup.alert({title: $translate.instant("ERROR"), template: res.data.data.join(", ")});
                }
            }).catch(function (error) {
                $ionicPopup.alert({title: $translate.instant("AUTHENTICATION_ERROR"), template: error.message});
                $ionicLoading.hide();
            });
        };
    })

    .controller('TellerUserViewOfferCtrl', function ($ionicPlatform, $scope, $state, $ionicPopup, $ionicLoading, $stateParams, $window, Maps, $cordovaGeolocation, $ionicHistory, $interval, $translate, Teller, Conversions) {
        'use strict';

        $scope.data = {};
        $scope.currency = JSON.parse($window.localStorage.getItem('myCurrency'));
        $scope.offer = $stateParams.offer;

        $scope.accept = function () {
            $ionicLoading.show({
                template: $translate.instant("LOADER_PROCESSING")
            });

            Teller.userAcceptOffer($scope.offer.id).then(function (res) {
                if (res.status === 200) {
                    $scope.offer = res.data.data;
                    $scope.offer.transaction.total = Conversions.from_cents($scope.offer.transaction.amount + $scope.offer.transaction.fee);
                    $scope.offer.transaction.amount = Conversions.from_cents($scope.offer.transaction.amount);
                    $scope.offer.transaction.fee = Conversions.from_cents($scope.offer.transaction.fee);

                    if ($scope.offer.transaction.tx_type == "withdraw") {
                        $window.localStorage.setItem('activeTellerWithdrawOffer', JSON.stringify($scope.offer));
                    } else if ($scope.offer.transaction.tx_type == "deposit") {
                        $window.localStorage.setItem('activeTellerDepositOffer', JSON.stringify($scope.offer));
                    }
                    $ionicLoading.hide();
                    $ionicHistory.nextViewOptions({
                        disableAnimate: true,
                        disableBack: true
                    });
                    $state.go('app.teller_user_view_offer', {
                        offer: $scope.offer
                    });
                } else {
                    $ionicLoading.hide();
                    $ionicPopup.alert({title: $translate.instant("ERROR"), template: res.data.data.join(", ")});
                }
            }).catch(function (error) {
                $ionicLoading.hide();
                $ionicPopup.alert({title: $translate.instant("AUTHENTICATION_ERROR"), template: error.message});
            });
        };

        $scope.cancel = function () {
            $ionicLoading.show({
                template: $translate.instant("LOADER_CANCELLING")
            });

            // Cancel the offer (but leave transaction as is)
            Teller.userCancelOffer($scope.offer.id).then(function (res) {
                if (res.status === 200) {
                    if ($scope.offer.transaction.tx_type == "withdraw") {
                        $window.localStorage.removeItem('activeTellerWithdrawOffer');
                    } else if ($scope.offer.transaction.tx_type == "deposit") {
                        $window.localStorage.removeItem('activeTellerDepositOffer');
                    }

                    $ionicLoading.hide();
                    $state.go('app.teller_user_search_offers', {
                        transaction: $scope.offer.transaction
                    });
                } else {
                    $ionicLoading.hide();
                    $ionicPopup.alert({title: $translate.instant("ERROR"), template: res.data.data.join(", ")});
                }
            }).catch(function (error) {
                $ionicPopup.alert({title: $translate.instant("AUTHENTICATION_ERROR"), template: error.message});
                $ionicLoading.hide();
            });
        };

        $scope.invalidate = function () {
            if ($scope.offer.transaction.tx_type == "withdraw") {
                $window.localStorage.removeItem('activeTellerWithdrawOffer');
            } else if ($scope.offer.transaction.tx_type == "deposit") {
                $window.localStorage.removeItem('activeTellerDepositOffer');
            }

            $ionicPopup.alert({title: $translate.instant("ERROR"), template: $translate.instant("INVALID_OFFER")});
            $state.go('app.teller_user_search_offers', {
                transaction: $scope.offer.transaction
            });
        };

        // Get offer
        // --------------------------------------------------

        var options = {timeout: 5000, enableHighAccuracy: true};

        $ionicPlatform.ready(function () {
            $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
                $scope.latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                Teller.updateLocation(position.coords.latitude, position.coords.longitude).then(function (res) {
                    if (res.status !== 200) {
                        $ionicPopup.alert({title: $translate.instant("ERROR"), template: res.data.data.join(", ")});
                    }
                }).catch(function (error) {
                    $ionicPopup.alert({title: $translate.instant("AUTHENTICATION_ERROR"), template: error.message});
                });

                Teller.userOffer($scope.offer.id).then(function (res) {
                    if (res.status === 200) {
                        $scope.offer = res.data.data
                        $scope.offer.transaction.total = Conversions.from_cents($scope.offer.transaction.amount + $scope.offer.transaction.fee)
                        $scope.offer.transaction.amount = Conversions.from_cents($scope.offer.transaction.amount)
                        $scope.offer.transaction.fee = Conversions.from_cents($scope.offer.transaction.fee)

                        if ($scope.offer.status === "Confirmed") {
                            $state.go('app.teller_user_view_completed_offer', {
                                offer: $scope.offer
                            });
                        }

                        var point_a = $scope.latLng;
                        var center = $scope.latLng;
                        var point_b = new google.maps.LatLng($scope.offer.user.latitude, $scope.offer.user.longitude);

                        var route = {point_a: point_a, center: center, point_b: point_b};
                        $window.localStorage.setItem('route', JSON.stringify(route));

                        $scope.map2 = new google.maps.Map(document.getElementById('map2'), {zoom: 4, center: center});
                        Maps.route($scope.map2, point_a, point_b);
                    } else {
                        $scope.invalidate();
                    }
                }).catch(function (error) {
                    $ionicPopup.alert({title: $translate.instant("AUTHENTICATION_ERROR"), template: error.message});
                });
            }, function (error) {
                $ionicPopup.alert({title: $translate.instant("ERROR"), template: $translate.instant("LOCATION_ERROR")});
            });
        });

        // --------------------------------------------------


        // Automatic check for completed transactions/offers
        // --------------------------------------------------

        // Every 5 seconds
        $scope.stop = $interval(checkOfferStatus, 5000);

        var dereg = $scope.$on('$destroy', function () {
            $interval.cancel($scope.stop);
            dereg();
        });

        function checkOfferStatus() {
            Teller.userOffer($scope.offer.id).then(function (res) {
                if (res.status === 200) {
                    $scope.offer = res.data.data
                    $scope.offer.transaction.total = Conversions.from_cents($scope.offer.transaction.amount + $scope.offer.transaction.fee)
                    $scope.offer.transaction.amount = Conversions.from_cents($scope.offer.transaction.amount)
                    $scope.offer.transaction.fee = Conversions.from_cents($scope.offer.transaction.fee)

                    if ($scope.offer.status === "Confirmed") {
                        $state.go('app.teller_user_view_completed_offer', {
                            offer: $scope.offer
                        });
                    }
                } else if (res.status == 400) {
                    $scope.invalidate();
                }
            }).catch(function (error) {
                $interval.cancel($scope.stop);
                $ionicPopup.alert({title: $translate.instant("AUTHENTICATION_ERROR"), template: error.message});
            });
        }

        // --------------------------------------------------

        $scope.mapToTeller = function () {
            $state.go('app.map_to_teller', {});
        };

    })

    .controller('MapToTellerCtrl', function ($scope, $state, $window, Maps) {
        'use strict';
        $scope.data = {};
        var route = JSON.parse($window.localStorage.getItem('route'));
        $scope.map3 = new google.maps.Map(document.getElementById('map3'), {zoom: 4, center: route['center']});
        Maps.route($scope.map3, route['point_a'], route['point_b']);
    })

    .controller('TellerUserViewCompletedOfferCtrl', function ($scope, $window, $state, $stateParams, $ionicPopup, $ionicLoading, $ionicHistory, $translate, Teller) {
        'use strict';

        $scope.offer = $stateParams.offer;
        $scope.rating = 1;

        $scope.rateUp = function () {
            $scope.rating = 1;
        };

        $scope.rateDown = function () {
            $scope.rating = 0;
        };

        $scope.rate = function (form) {
            if (form.$valid) {
                $ionicLoading.show({
                    template: $translate.instant("LOADER_PROCESSING")
                });

                Teller.userRateUser($scope.offer.id, $scope.rating, form.note.$viewValue).then(function (res) {
                    if (res.status === 200) {
                        // Clear saved data
                        if ($scope.offer.transaction.tx_type == "withdraw") {
                            $window.localStorage.removeItem('activeTellerWithdraw');
                            $window.localStorage.removeItem('activeTellerWithdrawOffer');
                        } else if ($scope.offer.transaction.tx_type == "deposit") {
                            $window.localStorage.removeItem('activeTellerDeposit');
                            $window.localStorage.removeItem('activeTellerDepositOffer');
                        }

                        $ionicHistory.nextViewOptions({
                            disableBack: true
                        });
                        $ionicLoading.hide();
                        $state.go('app.home');
                    } else {
                        $ionicLoading.hide();
                        $ionicPopup.alert({title: $translate.instant("ERROR"), template: res.data.data.join(", ")});
                    }
                }).catch(function (error) {
                    $ionicPopup.alert({title: $translate.instant("AUTHENTICATION_ERROR"), template: error.message});
                    $ionicLoading.hide();
                });
            }
        };
    })

    .controller('TellerCtrl', function ($ionicPlatform, $scope, $ionicPopup, $ionicModal, $state, $ionicLoading, $cordovaGeolocation, $translate, $window, Teller) {
        'use strict';

        $scope.tellerMode = JSON.parse($window.localStorage.getItem('tellerMode'));

        $scope.activateTellerMode = function () {
            $ionicLoading.show({
                template: $translate.instant("LOADER_ACTIVATING")
            });

            var options = {timeout: 5000, enableHighAccuracy: true};

            $ionicPlatform.ready(function () {
                $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
                    Teller.updateLocation(position.coords.latitude, position.coords.longitude).then(function (res) {
                        if (res.status === 200) {
                            $ionicLoading.hide();
                            $scope.tellerMode = 'enabled';
                            $window.localStorage.setItem('tellerMode', JSON.stringify($scope.tellerMode));
                        } else {
                            $ionicLoading.hide();
                            $ionicPopup.alert({title: $translate.instant("ERROR"), template: res.data.data.join(", ")});
                        }
                    }).catch(function (error) {
                        $ionicPopup.alert({title: $translate.instant("AUTHENTICATION_ERROR"), template: error.message});
                        $ionicLoading.hide();
                    });
                }, function (error) {
                    alert(error.message);
                });
            });
        };

        $scope.disableTellerMode = function () {
            $ionicLoading.show({
                template: $translate.instant("LOADER_DEACTIVATING")
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
                        res.data.results[i].total = Conversions.from_cents(res.data.results[i].amount + res.data.results[i].fee);
                        res.data.results[i].amount = Conversions.from_cents(res.data.results[i].amount);
                        res.data.results[i].fee = Conversions.from_cents(res.data.results[i].fee);
                        $scope.transactions.push(res.data.results[i]);
                    }
                    $scope.$broadcast('scroll.refreshComplete');
                }
            );
        };

        $scope.refreshData()
    })

    .controller('TellerViewTransactionCtrl', function ($state, $window, $stateParams, $scope, Teller, Conversions) {
        'use strict';

        $scope.currency = JSON.parse($window.localStorage.getItem('myCurrency'));

        $scope.refreshData = function () {
            Teller.tellerTransaction($stateParams.id).success(
                function (res) {
                    if (res.data.count > 0) {
                        $scope.transaction = res.data.results[0];
                        $scope.transaction.total = Conversions.from_cents($scope.transaction.amount + $scope.transaction.fee);
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
                        res.data.results[i].transaction.total = Conversions.from_cents(res.data.results[i].transaction.amount + res.data.results[i].transaction.fee);
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
                        res.data.results[i].transaction.total = Conversions.from_cents(res.data.results[i].transaction.amount + res.data.results[i].transaction.fee);
                        res.data.results[i].transaction.amount = Conversions.from_cents(res.data.results[i].transaction.amount);
                        res.data.results[i].transaction.fee = Conversions.from_cents(res.data.results[i].transaction.fee);
                        $scope.acceptedOffers.push(res.data.results[i]);
                        $scope.$broadcast('scroll.refreshComplete');
                    }

                    $scope.$broadcast('scroll.refreshComplete');
                }
            );
        }

        $scope.refreshData()
    })

    .controller('TellerCreateOfferCtrl', function ($scope, $ionicHistory, $ionicPopup, $ionicModal, $state, $stateParams, $ionicLoading, $window, $translate, Teller, Conversions) {
        'use strict';

        $scope.submit = function (form) {

            if (form.$valid) {

                $ionicLoading.show({
                    template: $translate.instant("LOADER_PROCESSING")
                });

                Teller.tellerCreateOffer($stateParams.id, form.note.$viewValue).then(function (res) {
                    if (res.status === 200) {
                        $scope.offer = res.data.data;
                        $scope.offer.transaction.total = Conversions.from_cents($scope.offer.transaction.amount + $scope.offer.transaction.fee)
                        $scope.offer.transaction.amount = Conversions.from_cents($scope.offer.transaction.amount);
                        $scope.offer.transaction.fee = Conversions.from_cents($scope.offer.transaction.fee);

                        $ionicLoading.hide();
                        $ionicHistory.nextViewOptions({
                            disableAnimate: true,
                            disableBack: true
                        });
                        $state.go('app.teller_offers', {
                            offer: $scope.offer
                        });
                    } else {
                        $ionicLoading.hide();
                        $ionicPopup.alert({title: $translate.instant("ERROR"), template: res.data.data.join(", ")});
                    }
                }).catch(function (error) {
                    $ionicPopup.alert({title: $translate.instant("AUTHENTICATION_ERROR"), template: error.data.message});
                    $ionicLoading.hide();
                });
            }
        };
    })

    .controller('TellerViewOfferCtrl', function ($scope, $ionicPopup, $ionicModal, $state, $stateParams, $ionicLoading, $window, $translate, Teller) {
        'use strict';

        $scope.offer = $stateParams.offer;
        $scope.currency = JSON.parse($window.localStorage.getItem('myCurrency'));

        $scope.submit = function (form) {
            if (form.$valid) {
                $ionicLoading.show({
                    template: $translate.instant("LOADER_PROCESSING")
                });
                Teller.tellerConfirmOffer($scope.offer.id, form.code.$viewValue).then(function (res) {
                    if (res.status === 200) {
                        $ionicLoading.hide();
                        $state.go('app.teller_completed_offer', {
                            offer: $scope.offer
                        });
                    } else {
                        $ionicLoading.hide();
                        $ionicPopup.alert({title: $translate.instant("ERROR"), template: res.data.data.join(", ")});
                    }
                }).catch(function (error) {
                    $ionicPopup.alert({title: $translate.instant("AUTEHNTICATION_ERROR"), template: error.data.message});
                    $ionicLoading.hide();
                });
            }
        };

        $scope.cancel = function () {
            $ionicLoading.show({
                template: $translate.instant("LOADER_CANCELLING")
            });

            // Cancel the offer (but leave transaction as is)
            Teller.tellerCancelOffer($scope.offer.id).then(function (res) {
                if (res.status === 200) {
                    $ionicLoading.hide();
                    $state.go('app.teller_offers');
                } else {
                    $ionicLoading.hide();
                    $ionicPopup.alert({title: $translate.instant("ERROR"), template: res.data.data.join(", ")});
                }
            }).catch(function (error) {
                $ionicPopup.alert({title: $translate.instant("AUTHENTICATION_ERROR"), template: error.message});
                $ionicLoading.hide();
            });
        };
    })

    .controller('TellerHistoryCtrl', function ($scope, $window, Teller, Conversions) {
        'use strict';

        $scope.currency = JSON.parse($window.localStorage.getItem('myCurrency'));

        $scope.refreshData = function () {
            Teller.tellerOffers($scope.currency.code).success(
                function (res) {
                    $scope.offers = [];

                    for (var i = 0; i < res.data.results.length; i++) {
                        res.data.results[i].transaction.total = Conversions.from_cents(res.data.results[i].transaction.amount + res.data.results[i].transaction.fee);
                        res.data.results[i].transaction.amount = Conversions.from_cents(res.data.results[i].transaction.amount);
                        res.data.results[i].transaction.fee = Conversions.from_cents(res.data.results[i].transaction.fee);
                        $scope.offers.push(res.data.results[i]);
                    }
                    $scope.$broadcast('scroll.refreshComplete');
                }
            );
        }

        $scope.refreshData()
    })

    .controller('TellerCompletedOfferCtrl', function ($scope, $window, $state, $stateParams, $ionicPopup, $ionicLoading, $ionicHistory, $translate, Teller) {
        'use strict';

        $scope.offer = $stateParams.offer;
        $scope.rating = 1;

        $scope.rateUp = function () {
            $scope.rating = 1;
        };

        $scope.rateDown = function () {
            $scope.rating = 0;
        };

        $scope.rate = function (form) {
            if (form.$valid) {
                $ionicLoading.show({
                    template: $translate.instant("LOADER_PROCESSING")
                });

                Teller.userRateUser($scope.offer.id, $scope.rating, form.note.$viewValue).then(function (res) {
                    if (res.status === 200) {
                        $ionicLoading.hide();
                        $ionicHistory.nextViewOptions({
                            disableBack: true
                        });
                        $state.go('app.teller');
                    } else {
                        $ionicLoading.hide();
                        $ionicPopup.alert({title: $translate.instant("ERROR"), template: res.data.data.join(", ")});
                    }
                }).catch(function (error) {
                    $ionicPopup.alert({title: $translate.instant("AUTHENTICATION_ERROR"), template: error.message});
                    $ionicLoading.hide();
                });
            }
        };

    })

    .filter('capitalize', function () {
        return function (input) {
            return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
        }
    });
