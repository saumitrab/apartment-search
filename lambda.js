'use strict';

const findApts = require('./src');

const aws = require('aws-sdk');
const ses = new aws.SES({
  region: 'us-east-1'
});

function sendEmail(content) {
  const eParams = {
    Destination: {
      ToAddresses: ["100friends@gmail.com", "cyberry.pop@gmail.com"]
    },
    Message: {
      Body: {
        Text: {
          Data: content
        }
      },
      Subject: {
        Data: `New Apts Alert ${new Date().toLocaleString()}`
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
  const { resultText, stats } = await findApts();
  if (stats.hits > 0) {
    sendEmail(resultText);
  } else {
    console.log('No new apartments found, skipping email');
  }
  return {
    statusCode: 200,
    body: JSON.stringify(apts),
  }
}
