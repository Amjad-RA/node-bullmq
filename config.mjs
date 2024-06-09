import Redis from 'ioredis';
const connection = {
  host: '127.0.0.1',
  port: 6379
};

const redisConnection = new Redis(connection);

export { redisConnection };