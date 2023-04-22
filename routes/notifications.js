const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const urlsafeBase64 = require('urlsafe-base64');
const vapid = require('../vapid.json');
const Storage = require('node-storage');

const Router = express.Router();
// Router.use(bodyParser.json());

webpush.setVapidDetails(
     'mailto: ray@stackacademy.tv',
     vapid.publicKey,
     vapid.privateKey
)

const store = new Storage(`${__dirname}/db`);

const subscribes = store.get('subscriptions') || [];

Router.get('/key', (req, res, next) => {
     console.log(vapid.publicKey);
     let public = urlsafeBase64.decode(vapid.publicKey);
     res.send(public);
});

Router.post('/subscribe', (req, res, next) => {
     let body = [];

     req.on('data', chunk => body.push(chunk)).on('end', () => {
          
          let subscription = JSON.parse(body.toString());

          subscribes.push(subscription);
          console.log(subscribes);
          store.put('subscriptions', subscribes);
          res.send('subscribed');
     });
});

Router.post('/push', (req, res, next) => {
     let body = [];

     req.on('data', chunk => body.push(chunk)).on('end', () => {

          subscribes.forEach((subscription, i) => {
               webpush.sendNotification(subscription, body.toString());
          });
          res.send('push send');
     });
});

module.exports = Router;