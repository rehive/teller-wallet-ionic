/*global Firebase, console, angular */
angular.module('generic-client.services.tellers', [])

    .service('Teller', function ($http, COMPANY_API) {
        'use strict';
        var self = this;

        self.updateLocation = function (latitude, longitude) {
            return $http.put(COMPANY_API + '/user/', {
                latitude: latitude,
                longitude: longitude
            });
        };

        self.userTransaction = function (tx_id) {
            return $http.get(COMPANY_API + '/user/transactions/' + tx_id +'/');
        };

        self.userCancelTransaction = function(offer_id) {
            return $http.put(COMPANY_API + '/user/transactions/' + offer_id + '/', {
                status: "Cancelled"
            });
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

        self.userCancelOffer = function(offer_id) {
            return $http.put(COMPANY_API + '/user/offers/' + offer_id + '/', {
                status: "Cancelled"
            });
        };

        self.deposit = function(amount, fee, currency) {
            return $http.post(COMPANY_API + '/user/transactions/deposit/', {
                amount: amount,
                fee: fee,
                currency: currency
            });
        };

        self.tellerTransactions = function (currency) {
            return $http.get(COMPANY_API + '/teller/transactions/?currency=' + currency);
        };

        self.tellerTransaction = function (tx_id) {
            return $http.get(COMPANY_API + '/teller/transactions/?id=' + tx_id);
        };

        self.tellerOffers = function (currency, status) {
            if (status !== undefined) {
                return $http.get(COMPANY_API + '/teller/offers/?transaction__currency=' + currency + '&status=' + status);
            } else {
                return $http.get(COMPANY_API + '/teller/offers/?transaction__currency=' + currency);
            }
        };

        self.tellerOffer = function (offer_id) {
            return $http.get(COMPANY_API + '/teller/offers/' + offer_id + '/');
        };

        self.tellerCreateOffer = function (tx_id, note) {
            return $http.post(COMPANY_API + '/teller/offers/', {
                tx_id: tx_id,
                note: note
            });
        };

        self.tellerCancelOffer = function(offer_id) {
            return $http.put(COMPANY_API + '/teller/offers/' + offer_id + '/', {
                status: "Cancelled"
            });
        };

        self.tellerConfirmOffer = function (offer_id, pin) {
            return $http.put(COMPANY_API + '/teller/offers/' + offer_id + '/', {
                status: "Confirmed",
                pin: pin
            });
        };

    });