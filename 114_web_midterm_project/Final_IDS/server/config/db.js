const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');

const connectDB = async () => {
    try {
        console.log('Attempting to connect to Local MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 3000 // Short timeout to fail fast
        });
        console.log('MongoDB Connected: Local');
    } catch (error) {
        console.warn(`Local MongoDB connection failed: ${error.message}`);
        console.log('Starting Embedded MongoDB (mongodb-memory-server)...');

        try {
            const dbPath = path.join(__dirname, '../../mongo-data');
            if (!fs.existsSync(dbPath)) {
                fs.mkdirSync(dbPath, { recursive: true });
            }

            // Create embedded instance with persistence disabled to prevent lock issues
            const mongod = await MongoMemoryServer.create({
                instance: {
                    // dbPath: dbPath, // Disabled for stability
                    storageEngine: 'wiredTiger'
                }
            });

            const uri = mongod.getUri();
            console.log(`Embedded MongoDB started at ${uri}`);

            await mongoose.connect(uri);
            console.log('MongoDB Connected: Embedded');

            // Should we run seed if empty? 
            // Let's just user helper to check content later or rely on user manual seed.

        } catch (embeddedError) {
            console.error(`Embedded MongoDB failed: ${embeddedError.message}`);
            process.exit(1);
        }
    }
};

module.exports = connectDB;
