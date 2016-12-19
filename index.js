/*
 * HelloCat - A simple Facebook Messenger Bot
 * Lets spread cat pictures all over the Internets.
 *
 */
/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */

'use-strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const config = require('config');
const _ = require('lodash');

const app = express();

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


/*
 * Configure some Facebook required vars
 * You can modify configs in the /config folder
 *
*/
// App Secret can be retrieved from the App Dashboard
const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ?
  process.env.MESSENGER_APP_SECRET :
  config.get('appSecret');

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
  (process.env.MESSENGER_VALIDATION_TOKEN) :
  config.get('validationToken');

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
  (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
  config.get('pageAccessToken');


if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN)) {
  console.error('Missing config values. Please see your /config folder to add them.');
  process.exit(1);
}


/*
 * Facebook Verification
 * Use your own validation token. Check that the token used in the Webhook
 * setup is the same token used here.
 *
*/
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    console.log('Validating webhook');
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error('Failed validation. Make sure the validation tokens match.');
    res.sendStatus(403);
  }
});


// Index of our app
app.get('/', (req, res) => {
  res.send('Meow! It\'s purrrfect!');
});


/*
 * Send our final message
 * ======================
 *
*/
function sendMessage(recipientId, messageData) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: PAGE_ACCESS_TOKEN,
    },
    method: 'POST',
    json: {
      recipient: {
        id: recipientId,
      },
      message: messageData,
    },
  }, (error, response) => {
    if (error) {
      console.log('Error sending messages: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}

/*
 * Used to verify all arguments in the user command
 *
*/
const tests = {
  keyword: ['cat', 'cats', 'meow'],
  category: ['hats', 'space', 'sunglasses', 'boxes', 'caturday', 'ties', 'dream', 'sinks', 'clothes'],
  format: ['jpg', 'png', 'gif'],
};

function verify(obj) {
  _.forEach(obj, (value, key) => {
    if (_.isNil(value) || !_.includes(tests[key], value)) {
      throw new Error(`🙀 Invalid ${key}. Type "help" for more informations.`);
    }
  });
}


/*
 * Send our cat image
 * ==================
 * @param {string} recipientId - The user ID
 * @param {string} text - The user message
 * @param {Object} messageData - The object containing a simple message or a rich message
*/
function catMessage(recipientId, text) {
  const command = text || '';
  const keys = ['keyword', 'category', 'format'];
  const values = command.split(' ');
  const params = _.zipObject(keys, values);
  const category = String(values[1]);
  const format = String(values[2]);

  console.log(`Keyword is: ${params.keyword}, Category is: ${params.category}, Format is: ${params.format}.`);

  // Replace YOUR_API_KEY with your api key
  // Go to http://thecatapi.com/api-key-registration.html to get one
  // Concat the URL for readability
  const apiUrl = 'http://thecatapi.com/api/';
  const catUrl = `${apiUrl}images/get?format=src&api_key=YOUR_API_KEY&category=${category}&type=${format}`;

  // If we have our 3 values in the user command
  if (values.length === 3) {
    try {
      verify(params);

      const messageData = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [{
              title: 'Meow 😽',
              subtitle: `Here is your ${category} cat`,
              image_url: catUrl,
              buttons: [{
                type: 'web_url',
                url: catUrl,
                title: 'Show cat',
              }, {
                type: 'postback',
                title: 'I like this',
                payload: `User ${recipientId} likes cat ${catUrl}`,
              }],
            }],
          },
        },
      };

      sendMessage(recipientId, messageData);
      console.log(`The cat URL is: ${catUrl}`);
    } catch (e) {
      const messageData = {
        text: e.message,
      };
      sendMessage(recipientId, messageData);
    }
    // If we don't have our 3 parameters in the initial command
  } else {
    const messageData = {
      text: '🙀 The correct command is "cat category format". Type "help" for more infos.',
    };

    sendMessage(recipientId, messageData);
  }

  return false;
}


/*
 * First API endpoint to process messages
 * ======================================
 * @param {string} sender - the user ID
 * @param {Object} events - contains the sender ID (user), recipient ID (page) timestamp and message
*/
app.post('/webhook/', (req, res) => {
  const events = req.body.entry[0].messaging;
  const data = req.body;

  // Make sure it's a page
  if (data.object === 'page') {
    for (let i = 0; i < events.length; i += 1) {
      const event = events[i];
      const sender = event.sender.id;

      if (event.message && event.message.text) {
        if (event.message.text === 'help') {
          // eslint-disable-next-line max-len
          sendMessage(sender, { text: 'Hi 😺 You can ask for a cat picture using 3 arguments: "keyword category format"\n\nkeyword: cat, cats, meow\n\ncategory, choose a category: hats, space, sunglasses, boxes, caturday, ties, dream, sinks, clothes\n\nformat, choose an image format: jpg, png, gif\n\nFor exemple if you want a gif with a cat in space, type "cat space gif"' });
        } else if (!catMessage(sender, event.message.text)) {
          sendMessage(sender, { text: `Your request was ${event.message.text}` });
        }
      // If the user send a picture to the bot
      } else if (event.message && event.message.attachments) {
        sendMessage(sender, { text: '😻 Thanks for your image but use the command "cat category format" ;)' });
      // If there is a postback event and the user click on it (I like this)
      } else if (event.postback) {
        console.log(`Postback received ${JSON.stringify(event.postback)}`);
        sendMessage(sender, { text: 'Yeah, I like this too 😻' });
      }
    }
    // Assume all went well.
    // We have 20 seconds to send a 200, otherwhise the request will time out
    res.sendStatus(200);
  }
});


// Fire all the stuff 🙀
// Webhooks must be available via SSL with a certificate signed by a valid
// certificate authority. In my tests, Heroku did the trick.
app.listen(app.get('port'), () => {
  console.log('Bot is running on port', app.get('port'));
});
