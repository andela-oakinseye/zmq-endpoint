import express from 'express';
import bodyParser from 'body-parser';
import protobuf from 'protobufjs';

import fs from 'fs';
import path from 'path';

// import schema from './zmq/schema.capnp';
import { publish, subscribe } from './zmq';

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const subPorts = {
    newOrderSubber: 5500,
    dbReaderSubber: 5553,
    bookProvSubber: 5559,
    barProvSubber: 5561
}

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
//   const newMessage = JSON.stringify(capnp.parse(schema.APIMessage, message));
//   console.log(newMessage);
//     return fs.appendFile(`outputs/port-${messagePORT}.txt`,  `${newMessage} \n`, (err) => {
//         if (err) throw err;
//       })

    protobufParser(DECODE, message).then((res) => {
        // return fs.appendFile(`outputs/port-${messagePORT}.txt`,  `${res} \n`, (err) => {
        //             if (err) throw err;
        //         });
        console.log('>>>>>>>>>>>>', res);
    }).catch(err => console.log(err));
}


Object.values(subPorts).forEach((port) => {
    subscribe(port, (message) => {
        switch(port) {
            case 5559:
                return writeOutput(5559, message);
                break;
            case 5552:
                return writeOutput(5552, message);
                break;
            case 5553:
                return writeOutput(5553, message);
                break;
            case 5557:
               return writeOutput(5557, message);
               break;
        }
    })
})


app.get('/',(req, res) => {
    res.sendFile(path.join(__dirname) + '/index.html');
})

app.post('/', (req, res) => {
    const port = Number(req.body.port);
    const message = JSON.parse(req.body.message);
    console.log(JSON.stringify(message, null, 1));
    // const serialedData = capnp.serialize(schema.APIMessage, message)
    // publish(port, serialedData);
    // return res.send('Message Published');
    protobufParser(ENCODE, message).then((response) => {
        publish(port, response);
        return res.send('Message Published');
    }).catch((err) => console.log(err));
})

app.listen(3200, () => {
    console.log('Running on port 3200')
});
