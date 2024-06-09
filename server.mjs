import { Queue, Worker } from 'bullmq';
import express from 'express';
import IORedis from 'ioredis';
import { redisConnection } from './config.mjs';
import bodyParser from 'body-parser';
const app = express()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const connection = new IORedis({
  maxRetriesPerRequest: null,
});

// Create a new connection in every instance
const jobQueue = new Queue('jobQueue', { redisConnection });

const hostname = '127.0.0.1';
const port = 3000;

app.get('/:data', (req, res) => {
  jobQueue.add('myJobName', { foo: req.params }, { delay: 10000 });
  res.status(200).send(req.params)
})

app.post('/add-job', async (req, res) => {
  console.log(req.body);
  const job = await jobQueue.add('job', req.body);
  res.status(201).json({ jobId: job.id });
});

const worker = new Worker('jobQueue', async (job)=>{
  console.log(job.data);
  // Do something with the job data
}, { connection });

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error ${err.message}`);
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
