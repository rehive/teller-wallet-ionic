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

    .controller('TellerRequestsCtrl', function ($scope) {
        'use strict';
        $scope.deposits = [{'request': 'Earn $2.00 for $100.00 deposit.', 'distance': '20 minutes away'}];

        $scope.withdrawals = [{'request': 'Earn $2.00 for $200.00 withdrawal.', 'distance': '20 minutes away'},
            {'request': 'Earn $1.00 for $20.00 withdrawal.', 'distance': '5 minutes away'}];
    })


    .controller('TellerViewRequestCtrl', function () {
        'use strict';
    })


    .controller('TellerMatchesCtrl', function ($scope) {
        'use strict';

        $scope.deposits = [{
            'request': 'Earn $2.00 for $100.00 deposit.', 'distance': 'Alice Wonderful is 20 minutes away.'
        }];
    })

    .controller('TellerHistoryCtrl', function () {
        'use strict';
    });