// import zeromq from 'zeromq';
const { log } = console;
// const subscribe = (port, cb) => {
//   const ZMQsub = zeromq.socket('sub');
//   const endpoint = `tcp://35.176.255.14:${port}`
//   ZMQsub.connect(endpoint);
//   ZMQsub.monitor();
//   ZMQsub.on('connect', () => {
//     console.log(`Sub Connection to ${port} established`)
//     ZMQsub.subscribe('');
//   });

//   ZMQsub.on('message', (message) => {
//     cb(message);
//   });
// };

/**
 * subscribeInit
 * connect and subscribe to a ZMQ port
 * @param {*} subber
 * @param {*} port
 * @param {*} cb
 * @return {Promise} promise
 */
const subscribe = (subber, port, cb) => new Promise((resolve) => {
  const endpoint = `tcp://35.176.255.14:${port}`;
  subber.connect(endpoint);
  subber.monitor();
  subber.on('connect', () => {
    log(`Connection to ${port} established`);
    subber.subscribe('');
    resolve();
  });
  subber.on('message', cb);
});

export default subscribe;
