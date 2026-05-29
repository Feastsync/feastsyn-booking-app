const Redis = require('ioredis');
const  client  = new Redis("redis://default:ByPUQCgAnLBqXeTNzZ0x60eUuGSrXMxI@turboclear-touch-trick-47832.db.redis.io:17624"
)


client.on('error', (err) => {
    console.error('Redis Error:', err);
});


client.on('connect', (err) => {
    console.log('Redis connected successfully');
});

module.exports = client;