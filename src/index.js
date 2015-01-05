"use strict";

var _ = require("lodash"),
    any = _.any,
    extend = _.extend,
    defaults = _.defaults,
    request = require("request"),
    GoogleMapsApiError = require("./google-maps-error"),
    Q = require("q");

var defaultConfig = {
    checkInputs: true,
    baseUrl: "https://maps.googleapis.com",
    defaultParams: {
        format: "json"
    }
};

module.exports = function(config) {

    config.defaultParams = defaults(config.defaultParams || {}, defaultConfig.defaultParams);
    config = defaults(config, defaultConfig);

    return {

        distanceMatrix: function distanceMatrix(origins, destinations, params, cb) {
            return Q.Promise(function(resolve, reject) {

                params = defaults(params, defaultConfig.defaultParams);

                if (config.checkInputs) {
                    if (any(origins, function(origin) { return !!~origin.indexOf("|"); }))
                        throw new Error("Invalid character in origin address");
                    if (any(destinations, function(destination) { return !!~destination.indexOf("|"); }))
                        throw new Error("Invalid character in destination address");
                }

                var urlOrigins = origins.join("|"),
                    urlDestinations = destinations.join("|");

                request({
                    url: config.baseUrl + "/maps/api/distancematrix/" + params.format + "?",
                    qs: extend({ origins: urlOrigins, destinations: urlDestinations }, params),
                    json: true
                }, function(err, httpIM, response) {
                    if (err)
                        reject(err);
                    if (response.status!=="OK")
                        reject(new GoogleMapsApiError(response));
                    resolve(response);
                });

            }).nodeify(cb);
        }

    };

};
