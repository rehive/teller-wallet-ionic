angular.module('generic-client.controllers.teller', [])

    .controller('TellerCtrl', function ($scope, $state, $http, $window) {
        'use strict';
        $scope.data = {};

        $scope.activateTellerMode = function () {
            $window.localStorage.setItem('tellerMode', JSON.stringify('active'));
            $window.location.reload();
        };

        $scope.disableTellerMode = function () {
            $window.localStorage.setItem('tellerMode', JSON.stringify('disabled'));
            $window.location.reload();
        };

        console.log(JSON.parse($window.localStorage.getItem('tellerMode')));

    })

    .controller('TellerProcessCtrl', function ($scope, $state) {
        'use strict';

        $scope.submit = function (form) {
            if (form.$valid) {
                $state.go('app.teller_confirm');
            }
        };

    })

    .controller('TellerConfirmCtrl', function ($scope, $state) {
        'use strict';

        $scope.submit = function () {
            $state.go('app.teller_success');
        };

    })

    .controller('TellerSuccessCtrl', function ($scope, $state) {
        'use strict';
    })

    .controller('TellerOfferCtrl', function ($scope) {
        'use strict';
        $scope.deposits = [{'offer': 'Earn $2.00 for $100.00', 'distance': '20 minutes away'},
            {'offer': 'Earn $1.00 for $20.00', 'distance': '5 minutes away'}];

        $scope.withdrawals = [{'offer': 'Earn $2.00 for $100.00', 'distance': '20 minutes away'},
            {'offer': 'Earn $1.00 for $20.00', 'distance': '5 minutes away'}];
    })


    .controller('TellerMatchesCtrl', function () {
        'use strict';
    })

    .controller('TellerHistoryCtrl', function () {
        'use strict';
    });