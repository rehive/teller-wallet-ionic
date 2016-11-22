// Ionic Starter App
angular.module('generic-client', ['ionic',
    'intlpnIonic',
    'ngMessages',
    'ngFileUpload',
    'ngCordova',
    'generic-client.controllers',
    'generic-client.controllers.accounts',
    'generic-client.controllers.transactions',
    'generic-client.controllers.send',
    'generic-client.controllers.deposit',
    'generic-client.controllers.withdraw',
    'generic-client.controllers.receive',
    'generic-client.controllers.teller',
    'generic-client.controllers.promotions',
    'generic-client.controllers.request',
    'generic-client.controllers.fica',
    'generic-client.controllers.settings',
    'generic-client.controllers.notifications',
    'generic-client.controllers.help',
    'generic-client.controllers.about',
    'generic-client.controllers.currency_accounts',
    'generic-client.services',
    'generic-client.services.accounts',
    'generic-client.services.transactions',
    'generic-client.services.maps',
    'generic-client.services.contacts',
    'generic-client.services.settings',
    'generic-client.services.currency_accounts',
    'generic-client.services.tellers',
    'generic-client.filters.contacts'])

    .constant('API', 'http://localhost:8080/api/2')
    //.constant('API', 'https://rehive.com/api/2')
    .constant('COMPANY_API', 'http://localhost:8080/adapters/fundo')
    //.constant('COMPANY_API', 'https://rehive.com/adapters/fundo')
    .constant('COMPANY', 'test_company_1')
    //.constant('COMPANY', 'fundo_test_6')
    .constant('REFRESH_INTERVAL', 3000)

    .config(function ($httpProvider, $ionicConfigProvider, $compileProvider) {
        'use strict';
        //Switch off caching:
        $ionicConfigProvider.views.maxCache(0);
        $ionicConfigProvider.tabs.position('bottom');
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|bitcoin):/);
        //Insert JWT token into all api requests:
        $httpProvider.interceptors.push('authInterceptor');
    })

    .run(function ($ionicPlatform, $rootScope, $window, $ionicHistory, Auth, $state) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
                StatusBar.overlaysWebView(true);
                StatusBar.show();
            }
        });

        $rootScope.tellerMode = JSON.parse($window.localStorage.getItem('tellerMode'));

        $rootScope.logout = function () {
            Auth.logout();
            $state.go('login');
        };

        $rootScope.cancel = function () {
            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
            });
            $state.go('app.home');
        };
    })

    .config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
        $stateProvider

            // Accounts
            .state('login', {
                url: '/login',
                templateUrl: 'templates/accounts/login.html',
                controller: 'LoginCtrl'
            })

            .state('loading', {
                url: '/loading',
                templateUrl: 'templates/elements/loading.html',
                params: {
                    amount: null
                }
            })

            // App
            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'templates/elements/menu.html',
                controller: 'AppCtrl'
            })

            // Home
            .state('app.home', {
                url: '/home',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/home/index.html',
                        controller: 'TransactionsCtrl'
                    }
                }
            })

            // Transactions
            .state('app.transactions', {
                url: '/transactions',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/transactions/index.html',
                        controller: 'TransactionsCtrl'
                    }
                }
            })

            // Send
            .state('app.send', {
                url: '/send',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/send/index.html',
                        controller: 'SendCtrl'
                    }
                },
                params: {
                    amount: null,
                    currency: null,
                    note: null
                }
            })

            .state('app.send_to', {
                url: '/send_to',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/send/to.html',
                        controller: 'SendToCtrl'
                    }
                },
                params: {
                    amount: null,
                    currency: null,
                    note: null,
                    to: null
                }
            })

            .state('app.send_confirm', {
                url: '/send_confirm',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/send/confirm.html',
                        controller: 'SendConfirmCtrl'
                    }
                },
                params: {
                    amount: null,
                    currency: null,
                    note: null,
                    to: null
                }
            })

            .state('app.send_success', {
                url: '/send_success',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/send/success.html',
                        controller: 'SendSuccessCtrl'
                    }
                },
                params: {
                    amount: null,
                    note: null,
                    to: null,
                    currency: null
                }
            })

            // Withdraw
            .state('app.withdraw_to', {
                url: '/withdraw_to',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/withdraw/to.html',
                        controller: 'WithdrawToCtrl'
                    }
                },
                params: {
                    accType: null
                }
            })

            .state('app.withdraw_to_bitcoin_account', {
                url: '/withdraw_to_bitcoin_account/:account',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/withdraw/to_bitcoin_account.html',
                        controller: 'WithdrawToCtrl'
                    }
                },
                params: {
                    account: null,
                    accType: null
                }
            })

            .state('app.withdraw_to_bank_account', {
                url: '/withdraw_to_bank_account',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/withdraw/to_bank_account.html',
                        controller: 'WithdrawToCtrl'
                    }
                },
                params: {
                    account: null,
                    accType: null
                }
            })

            .state('app.withdraw_amount', {
                url: '/withdraw_amount',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/withdraw/amount.html',
                        controller: 'WithdrawAmountCtrl'
                    }
                },
                params: {
                    amount: null,
                    account: null
                }
            })

            .state('app.withdraw_confirm', {
                url: '/withdraw_confirm',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/withdraw/confirm.html',
                        controller: 'WithdrawConfirmCtrl'
                    }
                },
                params: {
                    amount: null,
                    account: null
                }
            })

            .state('app.withdraw_success', {
                url: '/withdraw_success',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/withdraw/success.html',
                        controller: 'WithdrawSuccessCtrl'
                    }
                },
                params: {
                    amount: null,
                    account: null
                }
            })

            // Deposit
            .state('app.deposit', {
                url: '/deposit',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/deposit/method.html',
                        controller: 'DepositCtrl'
                    }
                }
            })

            .state('app.bank_deposit', {
                url: '/bank_deposit',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/deposit/bank.html',
                        controller: 'BankDepositCtrl'
                    }
                }
            })

            .state('app.deposit_amount', {
                url: '/deposit_amount',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/deposit/amount.html',
                        controller: 'DepositAmountCtrl'
                    }
                },
                params: {
                    amount: null,
                    currency: null,
                    fee: null
                }
            })

            .state('app.search_offers', {
                url: '/search_offers',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/deposit/search_offers.html',
                        controller: 'SearchOffersCtrl'
                    }
                },
                params: {
                    transaction: null
                }
            })

            .state('app.view_offer', {
                url: '/view_offer',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/deposit/view_offer.html',
                        controller: 'ViewOfferCtrl'
                    }
                },
                params: {
                    offer: null
                }
            })

            .state('app.view_completed_offer', {
                url: '/view_completed_offer',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/deposit/view_completed_offer.html',
                        controller: 'ViewCompletedOfferCtrl'
                    }
                },
                params: {
                    offer: null
                }
            })

            .state('app.view_cancelled_offer', {
                url: '/view_cancelled_offer',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/deposit/view_cancelled_offer.html',
                        controller: 'ViewCancelledOfferCtrl'
                    }
                },
                params: {
                    offer: null
                }
            })

            // Teller
            .state('app.teller', {
                url: '/teller',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/teller/index.html',
                        controller: 'TellerCtrl'
                    }
                }
            })

            .state('app.teller_transactions', {
                url: '/teller_transactions',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/teller/transactions.html',
                        controller: 'TellerTransactionsCtrl'
                    }
                }
            })

            .state('app.teller_view_transaction', {
                url: '/teller_view_transaction',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/teller/view_transaction.html',
                        controller: 'TellerViewTransactionCtrl'
                    }
                },
                params: {
                    id: null
                }
            })

            .state('app.teller_offers', {
                url: '/teller_offers',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/teller/offers.html',
                        controller: 'TellerOffersCtrl'
                    }
                }
            })

            .state('app.teller_confirm_offer', {
                url: '/teller_confirm_offer',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/teller/confirm_offer.html',
                        controller: 'TellerConfirmOfferCtrl'
                    }
                },
                params: {
                    id: null
                }
            })

            .state('app.teller_completed_offer', {
                url: '/teller_completed_offer',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/teller/completed_offer.html',
                        controller: 'TellerCompletedOfferCtrl'
                    }
                },
                params: {
                    id: null
                }
            })

            .state('app.teller_create_offer', {
                url: '/teller_create_offer',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/teller/create_offer.html',
                        controller: 'TellerCreateOfferCtrl'
                    }
                },
                params: {
                    id: null
                }
            })

            .state('app.teller_history', {
                url: '/teller_history',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/teller/history.html',
                        controller: 'TellerHistoryCtrl'
                    }
                }
            })

            // Accounts
            .state('app.currency_accounts', {
                url: '/currency_accounts',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/currency_accounts/index.html',
                        controller: 'CurrencyAccountsCtrl'
                    }
                }
            })

            // Promotion
            .state('app.promotion_code', {
                url: '/promotion_code',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/promotions/code.html',
                        controller: 'PromotionCodeCtrl'
                    }
                }
            })

            .state('app.promotion_redeem', {
                url: '/promotion_redeem',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/promotions/redeem.html',
                        controller: 'PromotionRedeemCtrl'
                    }
                },
                params: {
                    promotion_code: null
                }
            })

            .state('app.promotion_success', {
                url: '/promotion_success',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/promotions/success.html',
                        controller: 'PromotionSuccessCtrl'
                    }
                },
                params: {
                    promotion_code: null
                }
            })

            // Request
            .state('app.request', {
                url: '/request',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/request/index.html',
                        controller: 'RequestCtrl'
                    }
                },
                params: {
                    amount: null,
                    note: null
                }
            })

            .state('app.request_from', {
                url: '/request_from',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/request/from.html',
                        controller: 'RequestFromCtrl'
                    }
                },
                params: {
                    amount: null,
                    note: null,
                    from: null
                }
            })

            .state('app.request_confirm', {
                url: '/request_confirm',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/request/confirm.html',
                        controller: 'RequestConfirmCtrl'
                    }
                },
                params: {
                    amount: null,
                    note: null,
                    from: null
                }
            })

            .state('app.request_success', {
                url: '/request_success',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/request/success.html',
                        controller: 'RequestSuccessCtrl'
                    }
                },
                params: {
                    amount: null,
                    note: null,
                    from: null
                }
            })

            .state('app.fica', {
                url: '/fica',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/fica/requirements.html',
                        controller: 'FicaRequirementsCtrl'
                    }
                },
                params: {
                    type: null
                }
            })

            .state('app.fica_id', {
                url: '/fica_id',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/fica/instructions_id.html',
                        controller: 'FicaIdCtrl'
                    }
                },
                params: {
                    type: null
                }
            })

            .state('app.fica_id_selfie', {
                url: '/fica_id_selfie',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/fica/instructions_id_selfie.html',
                        controller: 'FicaIdSelfieCtrl'
                    }
                },
                params: {
                    type: null
                }
            })

            .state('app.fica_proof_of_address', {
                url: '/fica_proof_of_address',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/fica/instructions_proof_of_address.html',
                        controller: 'FicaProofOfAddressCtrl'
                    }
                },
                params: {
                    type: null
                }
            })

            .state('app.fica_camera_upload', {
                url: '/fica_proof_of_address',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/fica/camera_upload.html',
                        controller: 'FicaCameraUploadCtrl'
                    }
                },
                params: {
                    file: null
                }
            })

            // About
            .state('app.about', {
                url: '/about',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/about/index.html',
                        controller: 'AboutCtrl'
                    }
                }
            })


            // Help
            .state('app.help', {
                url: '/coming_soon',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/help/index.html',
                        controller: 'HelpCtrl'
                    }
                }
            })

            // Notifications
            .state('app.notifications', {
                url: '/notifications',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/notifications/index.html',
                        controller: 'NotificationsCtrl'
                    }
                }
            })

            // Settings
            .state('app.settings', {
                url: '/settings',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/settings/index.html',
                        controller: 'SettingsCtrl'
                    }
                }
            })

            .state('app.personal_details', {
                url: '/personal_details',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/settings/personal_details.html',
                        controller: 'PersonalDetailsCtrl'
                    }
                },
                params: {
                    first_name: null,
                    last_name: null
                }
            })

            .state('app.emails', {
                url: '/emails',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/settings/emails.html',
                        controller: 'EmailCtrl'
                    }
                },
                params: {
                    email_address: null
                }
            })

            .state('app.mobiles', {
                url: '/mobiles',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/settings/mobiles.html',
                        controller: 'MobileCtrl'
                    }
                },
                params: {
                    mobile_number: null
                }
            })

            .state('app.verify_mobile', {
                url: '/verify_mobile',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/settings/verify_mobile.html',
                        controller: 'VerifyMobileCtrl'
                    }
                }
            })

            .state('app.add_address', {
                url: '/add_address',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/settings/add_address.html',
                        controller: 'AddressCtrl'
                    }
                }
            })

            .state('app.list_bank_accounts', {
                url: '/list_bank_accounts',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/settings/list_bank_accounts.html',
                        controller: 'BankAccountCtrl'
                    }
                }
            })

            .state('app.add_bank_account', {
                url: '/add_bank_account',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/settings/add_bank_account.html',
                        controller: 'BankAccountCtrl'
                    }
                }
            })


            .state('app.edit_bank_account', {
                url: '/edit_bank_account/:accId',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/settings/add_bank_account.html',
                        controller: 'BankAccountCtrl'
                    }
                }
            })

            .state('app.security', {
                url: '/security',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/settings/security.html',
                        controller: 'SecurityCtrl'
                    }
                }
            })

            .state('app.change_password', {
                url: '/change_password',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/settings/change_password.html',
                        controller: 'ChangePasswordCtrl'
                    }
                }
            })

            .state('app.two_factor', {
                url: '/two_factor',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/settings/two_factor_instructions.html',
                        controller: 'TwoFactorCtrl'
                    }
                }
            })

            .state('app.pin', {
                url: '/pin',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/settings/pin.html',
                        controller: 'PinCtrl'
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/home');
    });
