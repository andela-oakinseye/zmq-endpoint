import express from 'express';
import bodyParser from 'body-parser';
import capnp from 'capnp';

import fs from 'fs';
import path from 'path';

import schema from './zmq/schema.capnp';
import { publish, subscribe } from './zmq';

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const subPorts = {
    newOrderSubber: 5500,
    dbReaderSubber: 5553,
    bookProvSubber: 5559,
    barProvSubber: 5561
}


function writeOutput(messagePORT, message) {
  const newMessage = JSON.stringify(capnp.parse(schema.APIMessage, message));
  console.log(newMessage);
    return fs.appendFile(`outputs/port-${messagePORT}.txt`,  `${newMessage} \n`, (err) => {
        if (err) throw err;
      })
}


Object.values(subPorts).forEach((port) => {
    subscribe(port, (message) => {
        switch(port) {
            case 5500:
                return writeOutput(5500, message);
                break;
            case 5553:
                return writeOutput(5553, message);
                break;
            case 5559:
                return writeOutput(5559, message);
                break;
            case 5561:
               return writeOutput(5561, message);
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
    const serialedData = capnp.serialize(schema.APIMessage, message)
    publish(port, serialedData);
    return res.send('Message Published');
})

app.listen(3200, () => {
    console.log('Running on port 3200')
});
