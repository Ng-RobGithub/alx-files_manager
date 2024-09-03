import redisClient from './utils/redis.js';

const checkConnection = (maxRetries = 10, delay = 1000) => {
    return new Promise((resolve, reject) => {
        let retries = 0;
        const interval = setInterval(() => {
            if (redisClient.isAlive()) {
                clearInterval(interval);
                resolve();
            } else {
                console.log('Waiting for Redis client to connect...');
                retries += 1;
                if (retries >= maxRetries) {
                    clearInterval(interval);
                    reject(new Error('Redis client failed to connect within the given time'));
                }
            }
        }, delay);
    });
};

(async () => {
    try {
        console.log('Checking Redis connection...');
        await checkConnection();
        console.log('Redis client is alive:', redisClient.isAlive());

        // Proceed with Redis operations
        await redisClient.set('myKey', 12, 5);
        console.log('Value set in Redis');

        console.log(await redisClient.get('myKey'));

        setTimeout(async () => {
            console.log(await redisClient.get('myKey'));
        }, 1000 * 10);
    } catch (err) {
        console.error('Error:', err.message || err.toString());
    }
})();
