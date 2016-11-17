/*global Firebase, console, angular */
angular.module('generic-client.services.tellers', [])

    .service('Teller', function ($http, COMPANY_API) {
        'use strict';
        var self = this;

        self.activate = function () {
            return $http.put(COMPANY_API + '/user/', {
                teller: true,
                latitude: -33.935549,
                longitude: 18.397933
            });
        };

        self.deactivate = function () {
            return $http.put(COMPANY_API + '/user/', {
                teller: false
            });
        };

        self.userTransaction = function (tx_id) {
            return $http.get(COMPANY_API + '/user/transactions/' + tx_id +'/');
        };

        self.userOffers = function (tx_id) {
            return $http.get(COMPANY_API + '/user/offers/?transaction=' + tx_id);
        };

        self.userOffer = function (offer_id) {
            return $http.get(COMPANY_API + '/user/offers/' + offer_id + '/');
        };

        self.deposit = function(amount, fee, currency) {
            return $http.post(COMPANY_API + '/user/transactions/deposit/', {
                amount: amount,
                fee: fee,
                currency: currency.code
            });
        };

        self.tellerTransactions = function () {
            return $http.get(COMPANY_API + '/teller/transactions/');
        };

        self.tellerOffers = function () {
            return $http.get(COMPANY_API + '/teller/offers/');
        };

        self.tellerOffer = function (id) {
            return $http.get(COMPANY_API + '/teller/offers/' + id + '/');
        };

        self.tellerCreateOffer = function (id, fee, note) {
            return $http.post(COMPANY_API + '/teller/offers/', {
                tx_id: id,
                fee: fee,
                note: note
            });
        };

        self.tellerConfirmOffer = function (id, pin) {
            return $http.put(COMPANY_API + '/teller/offers/' + id + '/', {
                status: "Confirmed",
                pin: pin
            });
        };

    });