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

    .controller('DepositAmountCtrl', function ($scope, $state, $window) {
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
                var fundo_fee = parseFloat(amount * (2 / 100));
                var discount = parseFloat(-1 * amount * (1 / 100));
                var total = amount + fee + fundo_fee + discount;

                var deposit = {
                    amount: amount,
                    fee: fee,
                    fundo_fee: fundo_fee,
                    discount: discount,
                    total: total
                };

                $window.localStorage.setItem('deposit', JSON.stringify(deposit));
                $state.go('app.search_tellers');
            }
        };
    })

    .controller('SearchTellersCtrl', function ($scope, $state, $stateParams, $window, $timeout) {
        'use strict';

        $scope.data = {};
        $scope.currency = JSON.parse($window.localStorage.getItem('myCurrency'));
        $scope.deposit = JSON.parse($window.localStorage.getItem('deposit'));
        $scope.counter = 3;

        $scope.countDown = function () {
            c = $timeout(function () {
                $scope.counter--;
                $scope.countDown();
            }, 1000);
            if ($scope.counter <= 0) {
                $timeout.cancel(c);
                $state.go('app.select_teller');
            }
        };
        $scope.countDown();
    })

    .controller('SelectTellerCtrl', function ($scope, $state, $stateParams, $window, $ionicHistory, $ionicLoading, $cordovaGeolocation) {
        'use strict';

        $scope.data = {};
        $scope.currency = JSON.parse($window.localStorage.getItem('myCurrency'));

        $ionicLoading.show({
                template: 'Plotting Tellers...'
            });

        var options = {timeout: 10000, enableHighAccuracy: true};
        $cordovaGeolocation.getCurrentPosition(options).then(function (position) {

            var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            $window.localStorage.setItem('currentLocation', JSON.stringify(latLng));
            $scope.map = new google.maps.Map(document.getElementById('map'), {zoom: 15, center: latLng});

            var marker = new google.maps.Marker({position: latLng, map: $scope.map});

            marker.addListener('click', function () {
                $state.go('app.view_teller');
            });

            $ionicLoading.hide();
        }, function (error) {
            alert("Could not get location.");
        });

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

    .controller('ViewTellerCtrl', function ($scope, $state, $stateParams, $ionicPlatform, $window, Maps, $ionicHistory) {
        'use strict';

        $scope.data = {};
        $scope.currency = JSON.parse($window.localStorage.getItem('myCurrency'));
        $scope.tellerBool = JSON.parse($window.localStorage.getItem('tellerBool'));
        $scope.latLng = JSON.parse($window.localStorage.getItem('currentLocation'));
        $scope.deposit = JSON.parse($window.localStorage.getItem('deposit'));

        var point_a = $scope.latLng;
        var center = {lat: parseFloat(point_a['lat']) + parseFloat(0.01), lng: point_a['lng']};
        var point_b = {lat: parseFloat(point_a['lat']) + parseFloat(0.01), lng: point_a['lng']};

        var route = {point_a: point_a, center: center, point_b: point_b};
        $window.localStorage.setItem('route', JSON.stringify(route));

        $scope.map2 = new google.maps.Map(document.getElementById('map2'), {zoom: 4, center: center});

        $ionicPlatform.ready(function() {
            Maps.route($scope.map2, point_a, point_b);
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

        $scope.mapToTeller = function () {
            $state.go('app.map_to_teller', {});
        };
    })

    .controller('MapToTellerCtrl', function ($scope, $state, $window, Maps) {
        'use strict';

        $scope.data = {};
        $scope.currency = JSON.parse($window.localStorage.getItem('myCurrency'));
        var route = JSON.parse($window.localStorage.getItem('route'));

        $scope.map3 = new google.maps.Map(document.getElementById('map3'), {zoom: 4, center: route['center']});

        Maps.route($scope.map3, route['point_a'], route['point_b']);
    });

