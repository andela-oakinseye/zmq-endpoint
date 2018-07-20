import express from 'express';
import bodyParser from 'body-parser';
import protobuf from 'protobufjs';
import zeromq from 'zeromq';
import { log } from 'util';


import fs from 'fs';
import path from 'path';

import { publish, subscribe } from './zmq';

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// ZMQ subscription object instances for each sub ports
const ZMQdbSUB = zeromq.socket('sub');
const ZMQbarSUB = zeromq.socket('sub');
const ZMQbookSUB = zeromq.socket('sub');

const ZMQordersDEAL = zeromq.socket('dealer');
const ZMQdbDEAL = zeromq.socket('dealer');
const ZMQbarDEAL = zeromq.socket('dealer');

const subPorts = {
  dbSubber: 5552,
  barSubber: 5557,
  bookSubber: 5559
};

// Protobuf parser
const ENCODE = 'ENCODE';
const DECODE = 'DECODE';
let APIMessage;

protobuf.load("schema.proto")
  .then((root) => {
    APIMessage = root.lookupType('scheme.APIMessage');
  });

const protobufParser = (pattern, message) => new Promise((resolve, reject) => {
  if (pattern === DECODE) {
    const decoded = APIMessage.decode(message);
    return resolve(decoded);
  }

  if (pattern === ENCODE) {
    const buffer = APIMessage.encode(APIMessage.create(message)).finish();
    return resolve(buffer);
  }

  reject(Error('Unable to endode or decode'));
});

function writeOutput(messagePORT, message) {
    return fs.appendFile(`outputs/${messagePORT}.txt`, `${JSON.stringify(message)} \n \n`, (err) => {
  
        console.log(">>>>>>>>>>>>", messagePORT);
        if (err) throw err;
      });
}

// ZMQ (core) event handlers
const subInit = () => Promise.all([
  subscribe(ZMQdbSUB, subPorts.dbSubber, (ZMQmessage) => {
    protobufParser(DECODE, ZMQmessage).then((message) => {
      if (message.orderStatus) {
        writeOutput('ORDER_STATUS', message);
      } else if (message.exchange) {
        writeOutput('EXCHANGE', message);

      }
    }).catch(err => log(err));
  }),

  subscribe(ZMQbarSUB, subPorts.barSubber, (ZMQmessage) => {
    protobufParser(DECODE, ZMQmessage).then((message) => {
      writeOutput('BAR_RESPONSE', message);

    }).catch(err => log(err));

  }),

  subscribe(ZMQbookSUB, subPorts.bookSubber, (ZMQmessage) => {
    // // log('Something on ZMQbookSUB');
    // protobufParser(DECODE, ZMQmessage).then((message) => {
    //   // log('Message parsed by protobuf:: ', message);
    //   // if (message.bookresponse) {
    //   //   writeOutput('BOOK_RESPONSE', message);
    //   // }
    //   // Not implemented on TPT side ATM
    //   //  else if (message.bookUpdate) {
    //   //   receiveBookUpdate(message.bookUpdate);
    //   // }
    // }).catch(err => log(err));
  }),
]);

const dealerPorts = {
  orderDealer: 5553,
  dbDealer: 5551,
  barDealer: 5556
};

const dealerInit = () => Promise.all([
  publish(ZMQordersDEAL, dealerPorts.orderDealer, (...ZMQmessage) => {
    ZMQmessage = ZMQmessage[1];
    protobufParser(DECODE, ZMQmessage).then((message) => {
      log(message)
      writeOutput('ORDER_DEALER', message);
    }).catch(err => log(err));
  }),
  publish(ZMQdbDEAL, dealerPorts.dbDealer, (...ZMQmessage) => {
    ZMQmessage = ZMQmessage[1];
    protobufParser(DECODE, ZMQmessage).then((message) => {
      if (message.syncResponse) {
      log(message)
      writeOutput('SYNC_RESPONSE', message);
      } else if (message.activeOrdersResponse) {
      log(message)
      writeOutput('ACTIVE_ORDERS_RESPONSE', message);
      }
    }).catch(err => log(err));
  }),
  publish(ZMQbarDEAL, dealerPorts.barDealer, (...ZMQmessage) => {
    ZMQmessage = ZMQmessage[1];
    protobufParser(DECODE, ZMQmessage).then((message) => {
      log(message)
      writeOutput('BAR_DEALER', message);
    }).catch(err => log(err));
  })
]);


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname) + '/index.html');
})

app.post('/', (req, res) => {
  const port = Number(req.body.port);
  const message = JSON.parse(req.body.message);
  console.log(JSON.stringify(message, null, 1));
  console.log('port:', port);

  let ZMQsocket;
  if (message.newOrderRequest || message.orderCancelRequest || message.orderStatusRequest) {
    ZMQsocket = ZMQordersDEAL;
  } else if (message.activeOrdersRequest || message.syncRequest || message.exchangesRequest) {
    ///Avoids huge cascades of syncRequest messages
    if (message.syncRequest && ZMQdbDEAL.busySyncing)
      return;
    else {
      setTimeout(() => ZMQdbDEAL.busySyncing = false, 1000);
      ZMQdbDEAL.busySyncing = true;
    }
    ZMQsocket = ZMQdbDEAL;
  } else if (message.barRequest) {
    ZMQsocket = ZMQbarDEAL;
  }

  log(`Sending to core: ${JSON.stringify(message)}`);
  protobufParser(ENCODE, message).then((buffer) => {
    ZMQsocket.send(["", buffer]);
    res.send('Message Published');
  }).catch(err => log(err));
});

subInit();
dealerInit();

app.listen(3200, () => {
  console.log('Running on port 3200')
});
