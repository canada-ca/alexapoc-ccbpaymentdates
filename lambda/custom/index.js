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
    const speechText = 'Welcome to Canada Revenue Agency! You can ask about the Canada Child Benefit or the 2019 tax filing deadline.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('CRA', speechText)
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
    const speechText = 'The Canada Child Benefit (CCB) is a tax-free monthly payment made to eligible families to help them with the cost of raising children under 18 years of age.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('CRA', speechText)
      .withShouldEndSession(true)
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
      .withSimpleCard('CRA', speechText)
      .withShouldEndSession(true)
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
        .withSimpleCard('CRA', speechText)
        .withShouldEndSession(true)
        .getResponse();
    }
    if (returnedPaymentDates.length > 1) {
      speechText = 'I found multiple Payment Dates. Tell me which one of these you mean. ';
      for (var i in returnedPaymentDates) {
        speechText += returnedPaymentDates[i]['year'] + '. ';
      }

      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('CRA', speechText)
        .withShouldEndSession(true)
        .getResponse();
    }

    if (returnedPaymentDates.length == 1) {

      var mthNum = returnedPaymentDates[0]['mth'];
      mthNum = mthNum;
      var mthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];  

    //speechText = 'Month: ' + returnedPaymentDates[0]['mth'] + ' Day: '  + returnedPaymentDates[0]['day'] + ' Year: '  + returnedPaymentDates[0]['year'];

    speechText =  'Your Canada Child Benefit (CCB) next payment is ' + mthNames[mthNum] + ' '  + returnedPaymentDates[0]['day'] + ', '  + returnedPaymentDates[0]['year'] + '.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('CRA', speechText)
      .withShouldEndSession(true)
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
};

const TaxFilingDeadlineIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'TaxFilingDeadlineIntent';
  },
  handle(handlerInput) {
    const speechText = 'The Tax Filing Deadline is April 30, 2019.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('CRA', speechText)
      .withShouldEndSession(true)
      .getResponse();
  },
};


const RRSPContributionDeadlineIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RRSPContributionDeadlineIntent';
  },
  handle(handlerInput) {
    const speechText = 'The last date you can contribute to your RRSP is March 1, 2019.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('CRA', speechText)
      .withShouldEndSession(true)
      .getResponse();
  },
};

const ITEIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ITEIntent';
  },
  handle(handlerInput) {
    const speechText = 'The Individual Tax Enquiries telephone number is 1-800-959-8281.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('CRA', speechText)
      .withShouldEndSession(true)
      .getResponse();
  },
};


const IncomeTaxPaymentArrIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'IncomeTaxPaymentArrIntent';
  },
  handle(handlerInput) {
    const speechText = 'The Income Tax Payment Arrangements telephone number is 1-888-863-8657.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('CRA', speechText)
      .withShouldEndSession(true)
      .getResponse();
  },
};

const BobHamiltonIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'BobHamiltonIntent';
  },
  handle(handlerInput) {
    const speechText = 'Bob Hamilton was appointed as the Commissioner of the Canada Revenue Agency (CRA) effective August 1, 2016. Prior to joining the Canada Revenue Agency, Bob served as Deputy Minister of Environment Canada, and Deputy Minister of Natural Resources Canada. He received his Honours BA and Masters degrees in Economics from the University of Western Ontario.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('CRA', speechText)
      .withShouldEndSession(true)
      .getResponse();
  },
};

const CCBNextPaymentIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'CCBNextPaymentIntent';
  },
  handle(handlerInput) {
    const speechText = 'Your Canada Child Benefit (CCB) next payment is December 13, 2018.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('CRA', speechText)
      .withShouldEndSession(true)
      .getResponse();
  },
};

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
    TaxFilingDeadlineIntentHandler,
    RRSPContributionDeadlineIntentHandler,
    ITEIntentHandler,
    IncomeTaxPaymentArrIntentHandler,
    BobHamiltonIntentHandler,
    CCBNextPaymentIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
