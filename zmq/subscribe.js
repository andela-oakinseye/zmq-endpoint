import zeromq from 'zeromq';

const subber = zeromq.socket('sub');

const subscribe = (endpoint, cb) => {
  subber.connect(endpoint);
  subber.subscribe('');
  subber.on('message', (message) => {
    cb(message);
  });
};

export default subscribe;
