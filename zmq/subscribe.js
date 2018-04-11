import zeromq from 'zeromq';

const subscribe = (port, cb) => {  
  const subber = zeromq.socket('sub');
  const endpoint = `tcp://35.176.255.14:${port}`
  subber.connect(endpoint);
  subber.subscribe('');
  subber.on('message', (message) => {
    // console.log(message);
    // console.log(`New message from ${port}`);
    return cb(message);
  });
};

export default subscribe;
