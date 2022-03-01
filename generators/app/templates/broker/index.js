'use strict';

const Broker = require('@sap/sbf');

const CREATE_SERVICE_MILLIS = 20 * 1000;
let provisionData = {};

const broker = new Broker({
  autoCredentials: true,
  hooks: {
    onProvision: (params, callback) => {
      console.log("onProvision: Starting %s", params['instance_id']);
      provisionData[params['instance_id']] = false;

      // Delay the response with async function to simulate resource creation (like database schemas etc.)
      setTimeout(() => {
        provisionData[params['instance_id']] = true;
        console.log("onProvision: Finished %s", params['instance_id']);
      }, CREATE_SERVICE_MILLIS);

      // Because of { async: true } provision operation will be asynchronous
      callback(null, { async: true });
    },
    onDeprovision: (params, callback) => {
      console.log("onDeprovision: Starting %s", params['instance_id']);
      // Free any resources created during provision of the service instance
      callback(null, {});
    },
    onLastOperation: (params, callback) => {
      let state = 'in progress';
      if (provisionData[params['instance_id']]) {
        state = 'succeeded';
      }
      console.log("onLastOperation: %s %s", params['instance_id'], state);
      callback(null, { state });
    }
  }
});
broker.start();
