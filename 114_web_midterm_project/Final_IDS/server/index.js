const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/bids', require('./routes/bids'));
app.use('/api/orders', require('./routes/orders'));

// Socket.io connection
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinProduct', (productId) => {
        socket.join(`product:${productId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Make io accessible in routes
app.set('io', io);

app.get('/', (req, res) => {
    res.send('SocksTrading API is running');
});

// Temporary Seed Route for debugging embedded DB
// Temporary Seed Route for debugging embedded DB
const seedData = async () => {
    try {
        const FixedProduct = require('./models/FixedProduct');
        const AuctionProduct = require('./models/AuctionProduct');
        const User = require('./models/User');

        // FORCE CLEAR for demo consistency
        await FixedProduct.deleteMany({});
        await AuctionProduct.deleteMany({});

        console.log('Seeding initial data...');

        // Create a dummy seller ID for required field
        let seller = await User.findOne({ username: 'SystemSeller' });
        if (!seller) {
            seller = await User.create({
                username: 'SystemSeller',
                email: 'system@socks.com',
                password: 'hashedpassword123',
                avatar: './server/uploads/seller_rock.jpg' // Default
            });
        }

        const products = [
            {
                title: '絕版經典原味襪',
                price: 500,
                sellerName: 'Rock',
                sellerAvatar: './server/uploads/seller_rock.jpg',
                images: ['./server/uploads/socks1.jpg'],
                description: '這雙襪子充滿了力量與汗水。',
                mode: 'auction',
                endTime: Date.now() + 86400000,
                status: 'active'
            },
            {
                title: '戰鬥用白襪',
                price: 1000,
                sellerName: 'Ricardo',
                sellerAvatar: './server/uploads/seller_ricardo_new.jpg',
                images: ['./server/uploads/socks1.jpg'],
                description: '象徵自由與奔放的靈魂。',
                mode: 'auction',
                endTime: Date.now() + 7200000,
                status: 'active'
            },
            {
                title: '頂級奢華黑絲襪',
                price: 5000,
                sellerName: 'Trump',
                sellerAvatar: './server/uploads/seller_trump.jpg',
                images: ['./server/uploads/socks_tights.png'],
                description: '這不是普通的襪子，這是最好的襪子。',
                mode: 'fixed',
                status: 'active'
            },
            {
                title: '健身專用襪',
                price: 250,
                sellerName: 'Rock',
                sellerAvatar: './server/uploads/seller_rock.jpg',
                images: ['./server/uploads/socks1.jpg'],
                description: '健身房必備，耐磨透氣。',
                mode: 'fixed',
                status: 'active'
            },
            {
                title: 'Ugly Beauty 限定襪',
                price: 3000,
                sellerName: 'Jolin',
                sellerAvatar: './server/uploads/seller_jolin.jpg',
                images: ['./server/uploads/socks_demo_2.jpg'],
                description: '演唱會限定周邊。',
                mode: 'auction',
                endTime: Date.now() + 36000000,
                status: 'active'
            },
            {
                title: 'Neuralink 連接襪',
                price: 800,
                sellerName: 'Elon',
                sellerAvatar: './server/uploads/seller_elon.jpg',
                images: ['https://images.unsplash.com/photo-1586350977771-b3b0abd50c82'],
                description: '雖然不能連網，但看起來很有科技感。',
                mode: 'fixed',
                status: 'active'
            }
        ];

        const fixedItems = products.filter(p => p.mode === 'fixed').map(p => ({
            ...p,
            seller: seller._id,
            price: p.price
        }));
        const auctionItems = products.filter(p => p.mode === 'auction').map(p => ({
            ...p,
            seller: seller._id,
            startPrice: p.price,
            currentPrice: p.price
        }));

        if (fixedItems.length > 0) {
            await FixedProduct.insertMany(fixedItems);
        }
        if (auctionItems.length > 0) {
            await AuctionProduct.insertMany(auctionItems);
        }
        console.log('✅ Auto-Seeded Demo Data into Dual DBs!');
    } catch (err) {
        console.error('Auto-Seed Error:', err);
    }
};

// Run seed on proper connection
const db = require('mongoose').connection;
db.once('open', () => {
    seedData();
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
