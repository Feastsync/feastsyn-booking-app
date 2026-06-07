const Redis = require('ioredis');
const  client  = new Redis(process.env.REDIS_CLIENT_URL);

client.on('error', (err) => {
    console.error('Redis Error:', err);
});


client.on('connect', (err) => {
    console.log('Redis connected successfully');
});

module.exports = client;