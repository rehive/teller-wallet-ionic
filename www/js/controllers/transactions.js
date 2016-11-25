angular.module('generic-client.controllers.transactions', [])

    .controller('TransactionsCtrl', function ($scope, $state, $http, $window, $ionicModal, $ionicLoading, Transaction, Balance, Conversions) {
        'use strict';

        $scope.cleanTransactionDetails = function (transaction) {
            transaction.id = i;

            // If a teller deposit/withdraw
            if (transaction.metadata.teller !== undefined) {
                transaction.description = "Teller " + transaction.metadata.type;

                if (transaction.metadata.type === "deposit") {
                    transaction.amount = Conversions.from_cents(transaction.amount);
                    transaction.fee = Conversions.from_cents(transaction.fee);
                    transaction.metadata.fee = Conversions.from_cents(transaction.metadata.fee);
                } else if (transaction.metadata.type === "withdraw") {
                    if (transaction.amount > 0) {
                        transaction.amount = Conversions.from_cents((transaction.amount - transaction.metadata.fee));
                    } else {
                        transaction.amount = Conversions.from_cents((transaction.amount + transaction.metadata.fee));
                    }
                    transaction.metadata.fee = Conversions.from_cents(transaction.metadata.fee);
                    transaction.fee = Conversions.from_cents(transaction.fee);
                }
            // Normal transactions
            } else {
                transaction.amount = Conversions.from_cents(transaction.amount);
            }

            return transaction;
        };

        $scope.refreshData = function () {
            var getBalance = Balance.get();

            getBalance.success(
                function (res) {
                    $window.localStorage.setItem('myCurrency', JSON.stringify(res.data.currency));
                    $scope.balance = Conversions.from_cents(res.data.balance);
                    $scope.currency = res.data.currency;

                    var getTransactions = Transaction.list();

                    getTransactions.success(
                        function (res) {
                            $scope.items = [];

                            for (var i = 0; i < res.data.results.length; i++) {
                                var transaction = $scope.cleanTransactionDetails(res.data.results[i])
                                $scope.items.push(transaction);
                            }

                            $window.localStorage.setItem('myTransactions', JSON.stringify($scope.items));
                            $scope.nextUrl = res.data.next;
                            $scope.$broadcast('scroll.refreshComplete');
                        }
                    );

                }
            );

            getBalance.catch(function (error) {

            });
        };

        $scope.loadMore = function () {
            if ($scope.nextUrl) {
                $http.get($scope.nextUrl).success(
                    function (res) {
                        for (var i = 0; i < res.data.results.length; i++) {
                            var transaction = $scope.updateTransactionDetails(res.data.results[i])
                            $scope.items.push(transaction);
                        }

                        $scope.nextUrl = res.data.next;
                    }
                );
            }
            $scope.$broadcast('scroll.infiniteScrollComplete');
        };

        $scope.$on('$ionicView.afterEnter', function () {
            if ($window.localStorage.myTransactions) {
                $scope.items = JSON.parse($window.localStorage.myTransactions);
            }

            $scope.refreshData();
        });
    });
