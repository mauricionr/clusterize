const cluster = require('cluster');
const numCPUs = require('os').cpus().length;


const clusterize = (fns = [], args = []) => {
  if (cluster.isMaster) {
    
    console.log('Master process is running');

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
  
    cluster.on('exit', (worker, code, signal) => {
      
      console.log(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
      
      console.log('Starting a new worker');
      
      cluster.fork();
    });
  
  } else {

    fns.forEach(fn => fn.apply(null, args));

    cluster.worker.on('message', (msg) => {
      console.log(`Message from master received by worker ${cluster.worker.id}: ${msg}`);
    });

    process.send(`Hello master, I am the worker ${cluster.worker.id}!`);
    
  }
}

module.exports = clusterize;

// const test = (args) => {
//   console.log('Test 1', args)
// }

// const test2 = () => {
//   console.log('Test 2')
// }

// clusterize([test, test2], ['Hello world'])