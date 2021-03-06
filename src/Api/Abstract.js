'use strict';

/**
 * @requires joi
 */
var joi = require('joi');

/**
 * @requires lodash as _
 */
var _ = require('lodash');

var ApiError = require('./Error');

var ApiErrorCodes = require('./ErrorCodes');

/**
 * @class
 * @abstract
 */
class ApiAbstract {

    /**
     * @constructor
     * @param  {Object} models
     * @param  {Object} api
     */
    constructor(models, api) {
        this._models = models;
        this._api = api;
        this._systemFields = null;

        this.errorCodes = {};
    }

    /**
     * validate data by schema
     *
     * using joi module
     *
     * @param  {Object} data
     * @param  {Object} schema
     * @param  {Object} options
     * @return {Promise}
     */
    _validate(data, schema, options) {

        return new Promise((resolve, reject) => {

            if (!options) {
                options = {};
            }

            var joiOptions = {
                convert: true,
                abortEarly: false
            };

            if (options.allowUnknown) {
                joiOptions.allowUnknown = options.allowUnknown;
            }

            joi.validate(data, schema, joiOptions, (err, data) => {

                if (err) {
                    var list = [];

                    _.each(err.details, function(e) {
                        list.push({message: e.message, path: e.path, type: e.type});
                    });

                    var e = new ApiError('invalid data');

                    e.code = ApiErrorCodes.INVALID_DATA;
                    e.list = list;

                    reject(e);
                    return;
                }

                resolve(data);
            });
        });

    }

    validate(data, schema, options) {
        return this._validate(data, schema, options);
    }

    /**
     * is empty data
     *
     * @param  {Object}  data
     * @return {Boolean}
     */
    _isEmptyData(data) {
        if (!data) {
            return false;
        }

        return _.keys(data).length ? false : true;
    }



    clearSystemFields(data) {

        if (!this._systemFields) {
            return data;
        }

        return _.omit(data, this._systemFields);
    }
}


module.exports = ApiAbstract;
