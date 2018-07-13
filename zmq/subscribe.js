import zeromq from 'zeromq';

const subscribe = (port, cb) => {
  const ZMQsub = zeromq.socket('sub');
  const endpoint = `tcp://35.176.255.14:${port}`
  ZMQsub.connect(endpoint);
  ZMQsub.monitor();
  ZMQsub.on('connect', () => {
    console.log(`Sub Connection to ${port} established`)
    ZMQsub.subscribe('');
  });

  ZMQsub.on('message', (message) => {
    cb(message);
  });
};

export default subscribe;
