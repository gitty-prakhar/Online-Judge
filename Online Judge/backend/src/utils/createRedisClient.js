import Redis from 'ioredis';

/**
 * Creates a configured Redis client that handles both standard local connections
 * and secure Upstash rediss:// URLs.
 */
export function createRedisClient(extraOptions ={}){
    if(process.env.REDIS_URL){
        return new Redis(process.env.REDIS_URL,{...extraOptions});
    }
    return new Redis({
        host:process.env.REDIS_HOST||'127.0.0.1',
        port:process.env.REDIS_PORT||6379,
        ...extraOptions
    });
}
