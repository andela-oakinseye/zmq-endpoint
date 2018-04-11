import express from 'express';
import bodyParser from 'body-parser';
import capnp from 'capnp';
import fs from 'fs';

import schema from './zmq/schema.capnp';
import path from 'path';


import { publish, subscribe } from './zmq';

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const subPorts = {
    newOrderSubber: 5500,
    dbReaderSubber: 5553,
    bookProvSubber: 5559,
    barProvSubber: 5561
}

function writeOutput(port, message) {
    return fs.appendFile(`port-${port}.txt`,  message.toString('utf8'), (err) => {
        if (err) throw err;
        console.log(`Mesage from ${port} saved`);
      })
}


Object.values(subPorts).forEach((port) => {
    console.log(port);

    // subscribe(5500, (message) => {
    //     console.log(message);
    // })
    
    // subscribe(port, (message) => {
    //     switch(port) {
    //         case 5500:
    //             // Write to file
    //             writeOutput(port, message);
    //             break;
    //         case 5553:
    //             // Write to file
    //             writeOutput(port, message);
    //             break;
    //         case 5559:
    //             // Write to file
    //             writeOutput(port, message);
    //             break;
    //         case 5561:
    //             // Write to file
    //             writeOutput(port, message);
    //             break;
    //     }
    // })
})


app.get('/',(req, res) => {
    res.sendFile(path.join(__dirname) + '/index.html');
})

app.post('/', (req, res) => {

    const newOrder =
      {
        "newOrderRequest":
        {
          "userID": "USER_0001",
          "orderID": "aowiefasmnie",
          "orderType": "GTC",
          "sellingCurrency": "BTC",
          "sellingQty": 1,
          "buyingCurrency": "USD",
          "buyingQty": 3,
          "userData": ""
        }
      };
    // console.log(req.body);
    // const port = Number(req.body.port);
    // // const message = JSON.parse(req.body.message);
    // const message = req.body.message;
    // console.log(typeof message, message);
    const serialedData = capnp.serialize(schema.APIMessage, newOrder)
    publish(5566, serialedData);
    return res.send('Message Published');
})

app.listen(3200, () => {
    console.log('Running on port 3001')
});