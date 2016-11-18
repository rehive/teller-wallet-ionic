/*global Firebase, console, angular */
angular.module('generic-client.services.tellers', [])

    .service('Teller', function ($http, COMPANY_API) {
        'use strict';
        var self = this;

        self.activate = function (latitude, longitude) {
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

        self.userAcceptOffer = function(offer_id) {
            return $http.put(COMPANY_API + '/user/offers/' + offer_id + '/', {
                status: "Accepted"
            });
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

        self.tellerTransaction = function (tx_id) {
            return $http.get(COMPANY_API + '/teller/transactions/?id=' + tx_id);
        };

        self.tellerOffers = function (status) {
            if (status !== undefined) {
                return $http.get(COMPANY_API + '/teller/offers/?status=' + status);
            } else {
                return $http.get(COMPANY_API + '/teller/offers/');
            }
        };

        self.tellerOffer = function (offer_id) {
            return $http.get(COMPANY_API + '/teller/offers/' + offer_id + '/');
        };

        self.tellerCreateOffer = function (tx_id, fee, note) {
            return $http.post(COMPANY_API + '/teller/offers/', {
                tx_id: tx_id,
                fee: fee,
                note: note
            });
        };

        self.tellerConfirmOffer = function (offer_id, pin) {
            return $http.put(COMPANY_API + '/teller/offers/' + offer_id + '/', {
                status: "Confirmed",
                pin: pin
            });
        };

    });