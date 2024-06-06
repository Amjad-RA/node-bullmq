import { Queue, Worker } from 'bullmq';
import express from 'express';
import IORedis from 'ioredis';
const app = express()

const connection = new IORedis({
  maxRetriesPerRequest: null,
});

// Create a new connection in every instance
const myQueue = new Queue('myqueue', { connection });
new Worker('myqueue', async (job)=>{
  console.log(job.data);
}, { connection });

const hostname = '127.0.0.1';
const port = 3000;

async function addJobs() {
  await myQueue.add('myJobName', { foo: 'bar' });
  await myQueue.add('myJobName', { qux: 'baz' });
}

await addJobs();

app.get('/:data', (req, res) => {
  myQueue.add('myJobName', { foo: req.params });
  res.status(200).send(req.params)
})

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
