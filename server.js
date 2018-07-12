import express from 'express';
import bodyParser from 'body-parser';
import protobuf from 'protobufjs';
import zeromq from "zeromq";

import fs from 'fs';
import path from 'path';

// import schema from './zmq/schema.capnp';
import { publish, subscribe } from './zmq';

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const ZMQsub = zeromq.socket('sub');
const ZMQdealer = zeromq.socket('dealer');

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
    return fs.appendFile(`outputs/port-${messagePORT}.txt`,  `${JSON.stringify(res)} \n`, (err) => {
      console.log(">>>>>>>>>>>>", messagePORT);
      if (err) throw err;
    });
  }).catch(err => console.log(err));
}

// ZMQ subscription object instances for each sub ports
Object.values(subPorts).forEach((port) => {
  subscribe(ZMQsub, port, message => {
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
  protobufParser(ENCODE, message).then((response) => {
    publish(ZMQdealer, port, response);
    return res.send('Message Published');
  }).catch((err) => console.log(err));
})

app.listen(3200, () => {
  console.log('Running on port 3200')
});
