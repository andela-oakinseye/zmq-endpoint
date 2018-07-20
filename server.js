import express from 'express';
import bodyParser from 'body-parser';
import protobuf from 'protobufjs';
import zeromq from 'zeromq';
import { log } from 'util';


import fs from 'fs';
import path from 'path';

// import schema from './zmq/schema.capnp';
import { publish, subscribe } from './zmq';

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const ZMQordersDEAL = zeromq.socket('dealer'),
  ZMQdbDEAL = zeromq.socket('dealer'),
  ZMQbarDEAL = zeromq.socket('dealer');

// const subPorts = {
//   newOrderSubber: 5500,
//   dbReaderSubber: 5553,
//   bookProvSubber: 5559,
//   barProvSubber: 5561
// }

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
  protobufParser(DECODE, message).then((res) => {
    if (res.bookresponse) {
      console.log('>>>>>>>>>>')
      return null;
    }
    return fs.appendFile(`outputs/port-${messagePORT}.txt`, `${JSON.stringify(res)} \n \n`, (err) => {
  
        console.log(">>>>>>>>>>>>", messagePORT);
        if (err) throw err;
      });
    }).catch(err => console.log(err));
}

// ZMQ subscription object instances for each sub ports
Object.values(subPorts).forEach((port) => {
  subscribe(port, message => {
    switch (port) {
      case 5559:
        return writeOutput(5559, message);
      case 5552:
        return writeOutput(5552, message);
      case 5553:
        return writeOutput(5553, message);
      case 5557:
        return writeOutput(5557, message);
    }
  });
})

const dealerPorts = {
  orderDealer: 5553,
  dbDealer: 5551,
  barDealer: 5556
};

const ZMQdealerInit = () => Promise.all([
  publish(ZMQordersDEAL, dealerPorts.orderDealer, (...ZMQmessage) => {
    log('Something on ZMQordersDEAL');
    ZMQmessage = ZMQmessage[1];
    writeOutput(dealerPorts.orderDealer, ZMQmessage);
    protobufParser(DECODE, ZMQmessage).then((message) => {
      log('Message parsed by protobuf:: ', message);
      // Nothing worthwhile to listen to on this channel
    }).catch(err => log(err));
  }),
  publish(ZMQdbDEAL, dealerPorts.dbDealer, (...ZMQmessage) => {
    log('Something on ZMQdbDEAL');
    ZMQmessage = ZMQmessage[1];
    writeOutput(dealerPorts.dbDealer, ZMQmessage);
    protobufParser(DECODE, ZMQmessage).then((message) => {
      log('Message parsed by protobuf:: ', message);
      if (message.syncResponse) {
        receiveSync(message.syncResponse);
      } else if (message.activeOrdersResponse) {
        message.activeOrdersResponse.activeOrders.orders.forEach(order => receiveOrderStatus(order, true));
      }
    }).catch(err => log(err));
  }),
  publish(ZMQbarDEAL, dealerPorts.barDealer, (...ZMQmessage) => {
    log('Something on ZMQbarDEAL');
    ZMQmessage = ZMQmessage[1];
    writeOutput(dealerPorts.barDealer, ZMQmessage);
    protobufParser(DECODE, ZMQmessage).then((message) => {
      log('Message parsed by protobuf:: ', message);
      // later
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
  // const serialedData = capnp.serialize(schema.APIMessage, message)
  // publish(port, serialedData);
  // return res.send('Message Published');
  // protobufParser(ENCODE, message).then((response) => {
  //   publish(port, response);
  //   return res.send('Message Published');
  // }).catch((err) => console.log(err));



  // publish(ZMQordersDEAL, port, (...ZMQmessage) => {
  //   log('Something on ZMQordersDEAL');
  //   ZMQmessage = ZMQmessage[1];
  //   protobufParser(DECODE, ZMQmessage).then((message) => {
  //     log('Message parsed by protobuf:: ', message);
  //     // Nothing worthwhile to listen to on this channel
  //   }).catch(err => log(err));
  // })

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
})

ZMQdealerInit();

app.listen(3200, () => {
  console.log('Running on port 3200')
});
