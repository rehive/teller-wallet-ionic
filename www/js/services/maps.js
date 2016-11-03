/*global Firebase, console, angular */
angular.module('generic-client.services.maps', [])

    .service('Maps', function ($http, API) {
        'use strict';
        var self = this;

        self.route = function (map, point_a, point_b) {

            var directionsService = new google.maps.DirectionsService;
            var directionsDisplay = new google.maps.DirectionsRenderer;

            directionsDisplay.setMap(map);

            function calculateAndDisplayRoute(directionsService, directionsDisplay) {
                directionsService.route({
                    origin: point_a,
                    destination: point_b,
                    travelMode: 'DRIVING'
                }, function (response, status) {
                    if (status === 'OK') {
                        directionsDisplay.setDirections(response);
                    } else {
                        window.alert('Directions request failed due to ' + status);
                    }
                });
            }

            calculateAndDisplayRoute(directionsService, directionsDisplay)

        };
    });