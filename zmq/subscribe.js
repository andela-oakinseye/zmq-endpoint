import zeromq from 'zeromq';

// const subber = zeromq.socket('sub');

const subscribe = (port, cb) => {
  console.log(port);
  
  // const endpoint = `tcp://35.176.255.14:${port}`
  // subber.connect(endpoint);
  // subber.subscribe('');
  // subber.on('message', (message) => {
  //   cb(message);
  // });
};

export default subscribe;
