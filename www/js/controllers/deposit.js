angular.module('generic-client.controllers.deposit', [])

    .controller('DepositCtrl', function ($scope, $state, $window, $stateParams) {
        'use strict';
        $scope.items = [{'title': 'Bank Deposit', 'method': 'bank_deposit'},
            {'title': 'Teller Deposit', 'method': 'teller_deposit'}];

        $scope.submit = function (method) {
            if (method == 'teller_deposit') {
                $state.go('app.deposit_amount');
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
                $state.go('app.search_tellers', {
                    amount: form.amount.$viewValue,
                    currency: $scope.currency,
                    fee: $scope.fee
                });
            }
        };
    })

    .controller('SearchTellersCtrl', function ($scope, $state, $window, $timeout) {
        'use strict';

        $scope.data = {};
        $scope.currency = JSON.parse($window.localStorage.getItem('myCurrency'));
        $scope.counter = 3;

        $scope.countDown = function () {
            c = $timeout(function () {
                $scope.counter--;
                $scope.countDown();
            }, 1000);
            if ($scope.counter <= 0) {
                $timeout.cancel(c);
                $state.go('app.select_teller', {
                    amount: $scope.amount,
                    currency: $scope.currency,
                    fee: $scope.fee
                });
            }
        };
        $scope.countDown();
    })

    .controller('SelectTellerCtrl', function ($scope, $state, $window, $ionicHistory) {
        'use strict';

        $scope.data = {};
        $scope.currency = JSON.parse($window.localStorage.getItem('myCurrency'));

        var uluru = {lat: -25.363, lng: 131.044};
        $scope.map = new google.maps.Map(document.getElementById('map'), {zoom: 4, center: uluru});
        var marker = new google.maps.Marker({position: uluru, map: $scope.map});

        marker.addListener('click', function () {
            $state.go('app.view_teller');
        });

        $scope.twoBack = function () {
            $ionicHistory.goBack(-2);
        };

        $scope.submit = function (form) {
            if (form.$valid) {
                $state.go('app.select_teller', {
                    amount: form.amount.$viewValue,
                    currency: $scope.currency,
                    fee: $scope.fee
                });
            }
        };
    })

    .controller('ViewTellerCtrl', function ($scope, $state, $window, Maps, $ionicHistory) {
        'use strict';

        $scope.data = {};
        $scope.currency = JSON.parse($window.localStorage.getItem('myCurrency'));
        $scope.tellerBool = JSON.parse($window.localStorage.getItem('tellerBool'));

        var point_a = {lat: 41.85, lng: -87.65};
        var point_b = {lat: 41.83, lng: -87.65};
        var center = {lat: 41.85, lng: -87.65};

        $scope.map2 = new google.maps.Map(document.getElementById('map2'), {zoom: 4, center: center});

        Maps.route($scope.map2, point_a, point_b);

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

        var point_a = {lat: 41.85, lng: -87.65};
        var point_b = {lat: 41.83, lng: -87.65};
        var center = {lat: 41.85, lng: -87.65};
        $scope.map3 = new google.maps.Map(document.getElementById('map3'), {zoom: 4, center: center});

        Maps.route($scope.map3, point_a, point_b);
    });

