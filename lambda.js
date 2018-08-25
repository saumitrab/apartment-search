'use strict';

const findApts = require('./src');

module.exports.run = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(await findApts()),
  }
}
