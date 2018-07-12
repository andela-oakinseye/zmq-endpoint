import zeromq from 'zeromq';

// const subscribe = (port, cb) => {
//   const subber = zeromq.socket('sub');
//   const endpoint = `tcp://35.176.255.14:${port}`
//   subber.connect(endpoint);
//   subber.monitor();
//   subber.on('connect', () => {
//     console.log(`Connection to ${port} established`)
//      subber.subscribe('');
//   });

//   subber.on('message', (message) => {
//     cb(message);
//   });
// };


const subscribe = (subber, port, cb) => new Promise((resolve) => {
  console.log('sub::', subber);
  const endpoint = `tcp://35.176.255.14:${port}`;
  subber.connect(endpoint);
  subber.monitor();
  subber.on('connect', () => {
    console.log(`Connection to ${port} established`);
    subber.subscribe('');
    resolve();
  });
  subber.on('message', cb);
});

export default subscribe;
