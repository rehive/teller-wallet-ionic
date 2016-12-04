angular.module('generic-client.controllers.convert', [])

    .controller('ConvertCtrl', function ($scope, $state, $window) {
        'use strict';

        $scope.submit = function (form) {
            if (form.$valid) {
                $state.go('app.convert_to', {
                    amount: form.amount.$viewValue,
                    currency: JSON.parse($window.localStorage.getItem('myCurrency')),
                    note: form.note.$viewValue
                });
            }
        };
    })

    .controller('ConvertToCtrl', function ($scope, $state, $stateParams, ContactsService) {
        'use strict';

        $scope.amount = $stateParams.amount;
        $scope.note = $stateParams.note;
        $scope.currency = $stateParams.currency;

        $scope.submit = function (form) {
            if (form.$valid) {
                $state.go('app.convert_confirm', {
                    amount: $scope.amount,
                    note: $scope.note,
                    currency: $scope.currency,
                    to_currency: form.to_currency.$viewValue
                });
            }
        };
    })

    .controller('ConvertConfirmCtrl', function ($scope, $rootScope, $state, $stateParams, $ionicLoading, $ionicHistory, Transaction, $ionicPopup, Conversions) {
        'use strict';

        $scope.quote = {};
        $scope.amount = $stateParams.amount;
        $scope.currency = $stateParams.currency;
        $scope.to_currency = $stateParams.to_currency;
        $scope.note = $stateParams.note;

        $scope.quote = function () {
            $ionicLoading.show({
                template: 'Getting Quote...'
            });

            Conversions.createQuote(Conversions.to_cents($scope.amount), $scope.currency.code, $scope.to_currency).then(function (res) {
                if (res.status === 201) {
                    $ionicLoading.hide();
                    $scope.quote = res.data;

                    $scope.quote.from_amount = Conversions.from_cents($scope.quote.from_amount)
                    $scope.quote.to_amount = Conversions.from_cents($scope.quote.to_amount)
                } else {
                    $ionicLoading.hide();
                    $ionicPopup.alert({title: "Error", template: res.data.message});
                    $ionicHistory.goBack(-2);
                }
            }).catch(function (error) {
                $ionicPopup.alert({title: 'Authentication failed', template: error.message});
                $ionicLoading.hide();
            });
        }

        $scope.confirm = function () {
            $ionicLoading.show({
                template: 'Converting...'
            });

            Conversions.createConversion($scope.quote.quote_ref, $rootScope.user.email, $scope.note).then(function (res) {
                if (res.status === 201) {
                    $ionicLoading.hide();
                    $state.go('app.convert_success', {
                        quote: $scope.quote,
                        note: $scope.note
                    });
                } else {
                    $ionicLoading.hide();
                    $ionicPopup.alert({title: "Error", template: res.data.message});
                    $ionicHistory.goBack(-2);
                }
            }).catch(function (error) {
                $ionicPopup.alert({title: 'Authentication failed', template: error.message});
                $ionicLoading.hide();
            });
        };

        $scope.quote();
    })

    .controller('ConvertSuccessCtrl', function ($scope, $state, $stateParams) {
        'use strict';

        $scope.quote = $stateParams.quote;
        $scope.note = $stateParams.note;
    });
