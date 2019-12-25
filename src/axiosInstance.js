const axios = require("axios");
const btoa = require("btoa");
const { logErr } = require("./logger");

const username = process.env.REGISTRY_USER;
const password = process.env.REGISTRY_PASS;
const basicAuth = "Basic " + btoa(username + ":" + password);

const axiosI = axios.create({
  baseURL: process.env.REGISTRY_URL
});

axiosI.defaults.headers.Authorization = basicAuth;

axiosI.interceptors.response.use(
  function(response) {
    return response;
  },
  function(error) {
    if (
      error.response &&
      error.response.status &&
      error.response.status === 401
    ) {
      logErr("Error authenticating. Please check credentials.");
    } else {
      logErr(error);
    }

    process.exit(1);
    // return Promise.reject(error);
  }
);

module.exports = {
  axiosI
};
