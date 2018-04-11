import zeromq from 'zeromq';

const publish = (port, message) => {
  const pubber = zeromq.socket('pub');
  const endpoint = `tcp://35.176.255.14:${port}`;
  pubber.connect(endpoint);  
  pubber.send(message);

  console.log('Message Published');
};

export default publish;
