import mongoose from 'mongoose';
import { User } from './src/models/user.model.js';
import connectDB from './src/db/index.js';
import dotenv from 'dotenv';
dotenv.config();

connectDB().then(async () => {
    const user = await User.findOneAndUpdate({}, { role: 'admin' }, { sort: { createdAt: -1 }, new: true });
    if (user) {
        console.log('Made latest user an admin:', user.username, user.email, user.role);
    } else {
        console.log('No user found to promote.');
    }
    process.exit(0);
}).catch(console.error);
