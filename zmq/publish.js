import zeromq from 'zeromq';

const pubber = zeromq.socket('pub');

const publish = (endpoint, message) => {
  pubber.connect(endpoint);
  pubber.send(message);
};

export default publish;
