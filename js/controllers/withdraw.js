angular.module('generic-client.controllers.withdraw', [])

    .controller('WithdrawToCtrl', function ($scope, $state, $window, $ionicHistory, $stateParams, BitcoinWithdrawalAccount, BankAccount) {
        'use strict';
        $scope.items = [{'title': 'Bank account', 'accType': 'bank_account'},
                        {'title': 'Teller Withdraw', 'accType': 'teller'}];
        $scope.data = {};
        $scope.accType = $stateParams.accType;

        var transaction = JSON.parse($window.localStorage.getItem('activeTellerWithdraw'));
        var offer = JSON.parse($window.localStorage.getItem('activeTellerWithdrawOffer'));

        if ($stateParams['account']) {
            $ionicHistory.goBack(-2);
            $state.go('app.withdraw_amount', {account: $stateParams['account']});
        }

        if ($scope.accType == 'bitcoin_account') {
            $scope.listData = function () {
                BitcoinWithdrawalAccount.list().success(
                    function (res) {
                        var items = [];
                        for (var i = 0; i < res.data.length; i++) {
                            items.push(res.data[i]);
                        }
                        $scope.items = items;
                        $window.localStorage.setItem('myBitcoinWithdrawalAccounts', JSON.stringify(items));
                        $scope.$broadcast('scroll.refreshComplete');
                    }
                );

            };
            $scope.listData();
        } else if ($scope.accType == 'bank_account') {
            $scope.listData = function () {
                BankAccount.list().success(
                    function (res) {
                        var items = [];
                        for (var i = 0; i < res.data.length; i++) {
                            items.push(res.data[i]);
                        }
                        $scope.items = items;
                        $window.localStorage.setItem('myBankAccounts', JSON.stringify(items));
                        $scope.$broadcast('scroll.refreshComplete');
                    }
                );

            };
            $scope.listData();
        }

        $scope.submit = function (accType) {
            if (accType === 'teller') {
                if (offer !== null && offer.id !== undefined) {
                    $state.go('app.teller_user_view_offer', {
                        offer: offer
                    });
                } else if (transaction !== null && transaction.id !== undefined) {
                    $state.go('app.teller_user_search_offers', {
                        transaction: transaction
                    });
                } else {
                    $state.go('app.teller_user_withdraw');
                }
            } else if (accType === 'bank_account') {
                $state.go('app.withdraw_to_bank_account', {
                    accType: accType
                });
            } else if (accType === 'bitcoin_account') {
                $state.go('app.withdraw_to_bitcoin_account', {
                    accType: accType
                });
            } else {
                $state.go('app.withdraw', {
                    accType: accType
                });
            }
        };

    })

    .controller('WithdrawAmountCtrl', function ($scope, $state, $stateParams) {
        'use strict';
        $scope.data = {};
        $scope.account = $stateParams.account;

        $scope.submit = function (form) {
            if (form.$valid) {
                $state.go('app.withdraw_confirm', {
                    amount: form.amount.$viewValue,
                    account: $scope.account
                });
            }
        };
    })

    .controller('WithdrawConfirmCtrl', function ($scope, $state, $window, $stateParams, $ionicLoading, $ionicPopup, $translate, Withdrawal, Conversions) {
        'use strict';
        $scope.data = {};
        $scope.amount = $stateParams.amount;
        $scope.account = $stateParams.account;
        $scope.currency = JSON.parse($window.localStorage.getItem('myCurrency'));

        $scope.submit = function (amount, account) {
            $ionicLoading.show({
                template: $translate.instant("LOADER_PROCESSING")
            });

            Withdrawal.create(Conversions.to_cents(amount), account).then(function (res) {
                if (res.status === 201) {
                    $ionicLoading.hide();
                    $state.go('app.withdraw_success', {
                        amount: amount,
                        reference: account
                    });
                } else {
                    $ionicLoading.hide();
                    $ionicPopup.alert({title: $translate.instant("ERROR"), template: res.data.message});
                }
            }).catch(function (error) {
                $ionicPopup.alert({title: $translate.instant("AUTHENTICATION_ERROR"), template: error.message});
                $ionicLoading.hide();
            });
        };
    })

    .controller('WithdrawSuccessCtrl', function ($scope, $state, $window, $stateParams) {
        'use strict';
        $scope.data = {};
        $scope.amount = $stateParams.amount;
        $scope.currency = JSON.parse($window.localStorage.getItem('myCurrency'));
    });