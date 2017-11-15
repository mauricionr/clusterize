const cluster = require('cluster');
const cpus = require('os').cpus();


const clusterize = (fns = [], args = [], length = 0) => {
  let numCPUs = length || cpus.length;
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

    fns.forEach((fn, index) => fn.apply(null, args[index]));

    cluster.worker.on('message', (msg) => {
      console.log(`Message from master received by worker ${cluster.worker.id}: ${msg}`);
    });

    process.send(`Hello master, I am the worker ${cluster.worker.id}!`);
    
  }
}

module.exports = clusterize;

const test = (args = []) => {
  console.log('\nTest 1', args)
}

const test2 = (args = []) => {
  console.log('\nTest 2', args)
}

clusterize([test, test2], [[process.pid], [process.pid]], 0)