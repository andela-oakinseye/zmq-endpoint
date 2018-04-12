import zeromq from 'zeromq';

const publish = (port, message) => {
  const pubber = zeromq.socket('pub');
  const endpoint = `tcp://35.176.255.14:${port}`;
  pubber.connect(endpoint);  
  pubber.on('connect', () => {
    console.log('Connection established');
    pubber.send(message);
    pubber.close();
  });

  console.log('Message Published');
};

export default publish;
