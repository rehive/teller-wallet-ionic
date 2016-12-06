angular.module('generic-client.controllers.deposit', [])

    .controller('DepositCtrl', function ($scope, $state, $window, $ionicHistory) {
        'use strict';
        $scope.items = [{'title': 'Bank Deposit', 'method': 'bank_deposit'},
            {'title': 'Teller Deposit', 'method': 'teller_deposit'}];

        var transaction = JSON.parse($window.localStorage.getItem('activeTellerDeposit'));
        var offer = JSON.parse($window.localStorage.getItem('activeTellerDepositOffer'));

        $scope.submit = function (method) {
            if (method == 'teller_deposit') {
                if (offer !== null && offer.id !== undefined) {
                    $state.go('app.teller_user_view_offer', {
                        offer: offer
                    });
                } else if (transaction !== null && transaction.id !== undefined) {
                    $state.go('app.teller_user_search_offers', {
                        transaction: transaction
                    });
                } else {
                    $state.go('app.teller_user_deposit');
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
    });

