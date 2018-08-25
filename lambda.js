'use strict';

const findApts = require('./src');

const aws = require('aws-sdk');
const ses = new aws.SES({
  region: 'us-east-1'
});

function sendEmail(content) {
  const eParams = {
    Destination: {
      ToAddresses: ["100friends@gmail.com"]
    },
    Message: {
      Body: {
        Text: {
          Data: content.toString()
        }
      },
      Subject: {
        Data: "New Apts Alert"
      }
    },
    Source: "100friends@gmail.com"
  };

  console.log('EMAIL: sending');
  ses.sendEmail(eParams, function (err, data) {
    if (err) console.log('EMAIL error', err);
    else {
      console.log('EMAIL sent');
    }
  });
}

module.exports.run = async (event) => {
  const apts = await findApts();
  sendEmail(apts);
  return {
    statusCode: 200,
    body: JSON.stringify(apts),
  }
}
