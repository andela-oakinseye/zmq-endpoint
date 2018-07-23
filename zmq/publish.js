import { log } from 'util';

const publish = (dealer, port, cb) => new Promise((resolve) => {
  const endpoint = `tcp://35.176.255.14:${port}`;
  dealer.connect(endpoint);
  dealer.monitor();
  dealer.on('connect', () => {
    log(`Connection established on port ${port}`);
    resolve();
  });
  dealer.on('message', cb);
});

export default publish;
