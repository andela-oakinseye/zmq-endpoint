import { log } from 'util';
import zeromq from 'zeromq';

// const publish = (port, message) => {
//   const ZMQdealer = zeromq.socket('dealer');
//   const endpoint = `tcp://35.176.255.14:${port}`;
//   console.log('Yo Im the ZMQ Dealer::::::::', ZMQdealer);
  
//   ZMQdealer.connect(endpoint);
//   ZMQdealer.monitor();
//   ZMQdealer.on('connect', () => {
//     console.log('Connection established');
//     console.log('Message Published');
//     ZMQdealer.send(["", message]);
//     ZMQdealer.close();
//   });
//   ZMQdealer.on('connect_delay', () => {
//     console.log('connect_delay');
//   });
//   ZMQdealer.on('connect_retry', () => {
//     console.log('connect_retry');
//   });

// };

// export default publish;

const publish = (dealer, port, cb) => new Promise((resolve) => {
  const endpoint = `tcp://35.176.255.14:${port}`;
  dealer.connect(endpoint);
  dealer.monitor();
  dealer.on('connect', () => {
    log(`Connection established on port ${port}`);
    resolve();
  });
  dealer.on('message', cb);
});

export default publish;
