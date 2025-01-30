import * as sdk from '@strapi/sdk-js';
const { strapi } = sdk;

strapi({
  baseURL: 'http://localhost:1337',
  token: 'strapi-token',
});

const res = await strapi.console.log(res);
