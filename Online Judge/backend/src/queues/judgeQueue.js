import { Queue } from 'bullmq';
import { createRedisClient } from '../utils/createRedisClient.js';

const redisConnection=createRedisClient({maxRetriesPerRequest:null});


export const judgeQueue=new Queue('judgeQueue',{
    connection:redisConnection 
});