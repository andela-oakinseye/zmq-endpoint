import zeromq from 'zeromq';

// const publish = (port, message) => {
//   const pubber = zeromq.socket('pub');
//   const endpoint = `tcp://35.176.255.14:${port}`;
//   pubber.connect(endpoint);
//   pubber.monitor();
//   pubber.on('connect', () => {
//     console.log('Connection established');
//     console.log('Message Published');
//     pubber.send(message);
//     pubber.close();
//   });
//   pubber.on('connect_delay', () => {
//     console.log('connect_delay');
//   });
//   pubber.on('connect_retry', () => {
//     console.log('connect_retry');
//   });

// };


const publish = (dealer, port, cb) => new Promise((resolve) => {
  console.log('dealer:', dealer);
  const endpoint = `tcp://35.176.255.14:${port}`;
  dealer.connect(endpoint);
  dealer.monitor();
  dealer.on('connect', () => {
   console. log(`Connection established on port ${port}`);
    resolve();
  });
  dealer.on('message', cb);
});

export default publish;
