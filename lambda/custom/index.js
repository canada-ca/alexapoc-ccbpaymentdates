/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
//const util = require('util');


const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to Canada Revenue Agency! How can I help you?';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const HelloWorldIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'HelloWorldIntent';
  },
  handle(handlerInput) {
    const speechText = 'Hello World!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const CCBDescIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'CCBDescIntent';
  },
  handle(handlerInput) {
    const speechText = 'The Canada child benefit (CCB) is a tax-free monthly payment made to eligible families to help them with the cost of raising children under 18 years of age.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('CCB Description', speechText)
      .withShouldEndSession(false)
      .getResponse();
  },
};

const RRSPMaxContributionIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RRSPMaxContributionIntent';
  },
  handle(handlerInput) {
    const speechText = 'Your deduction limit is 18% of your earned income, to a maximum value for the year. The maximum RRSP contribution for tax year 2018 is $29,930.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('RRSP Maximum Contribution', speechText)
      .withShouldEndSession(false)
      .getResponse();
  },
};


const NextPaymentIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'NextPaymentIntent';
  },
  async handle(handlerInput) {
    var currDate = new Date(Date.now());
    var currYear = currDate.getFullYear();
    var currMth = currDate.getMonth();
    var currDay = currDate.getDate();
    
    var speechText = '';
    //const parkName = handlerInput.requestEnvelope.request.intent.slots['query'].value;
    //const feeTable = await getFee(parkName.toLowerCase());
    const returnedPaymentDates = await getNextPayment(currYear, currMth, currDay);
    
    if (returnedPaymentDates.length == 0) {
      speechText = 'I have not found the Payment Dates you\'re looking for. Please say it again.';

      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Payment Dates', speechText)
        .withShouldEndSession(false)
        .getResponse();
    }
    if (returnedPaymentDates.length > 1) {
      speechText = 'I found multiple Payment Dates. Tell me which one of these you mean. ';
      for (var i in returnedPaymentDates) {
        speechText += returnedPaymentDates[i]['year'] + '. ';
      }

      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Payment Dates', speechText)
        .withShouldEndSession(false)
        .getResponse();
    }

    if (returnedPaymentDates.length == 1) {

      var mthNum = returnedPaymentDates[0]['mth'];
      mthNum = mthNum + 1;
      var mthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];  

    //speechText = 'Month: ' + returnedPaymentDates[0]['mth'] + ' Day: '  + returnedPaymentDates[0]['day'] + ' Year: '  + returnedPaymentDates[0]['year'];

    speechText =  'Your Canada child benefit (CCB) next payment is ' + mthNames[mthNum] + ' '  + returnedPaymentDates[0]['day'] + ' '  + returnedPaymentDates[0]['year'];

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .withShouldEndSession(false)
      .getResponse();
    }    
  },
};

function scanDb(params) {
  return docClient.scan(params).promise();
}

async function getNextPayment(currYear, currMth, currDay) {
  var paymentDates = 'unknown';

  console.log("Payment Dates: " + paymentDates);

  var params = {
    TableName: 'ccb_payment_dates',
    FilterExpression: '#yr = :yr AND #mt = :mt',
    ExpressionAttributeNames: {
      '#yr': 'year',
      '#mt': 'mth',
      '#d': 'day'
    },
    ExpressionAttributeValues: {
      ':yr': currYear,
      ':mt': currMth
    },
    ProjectionExpression: '#yr,#mt,#d'
  };

  var data = await scanDb(params);
  if (data['Count'] >= 1) {
    paymentDates = data['Items'];//[0]['Fees list'][0]['Fee'];
  }

  console.log('Number of paymentDates returned: ' + paymentDates.length);

  return paymentDates;
}


const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    HelloWorldIntentHandler,
    CCBDescIntentHandler,
    RRSPMaxContributionIntentHandler,
    NextPaymentIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
