const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');

dotenv.config();

mongoose.connect('mongodb://127.0.0.1:27017/socks_trading', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected for Seeding'))
    .catch(err => console.log(err));

const seedProducts = [
    {
        title: '絕版經典原味襪',
        price: 500,
        sellerName: 'Rock',
        sellerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rock',
        images: ['https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&q=80&w=300'],
        description: '這雙襪子充滿了力量與汗水。',
        mode: 'auction',
        endTime: Date.now() + 86400000,
        status: 'active'
    },
    {
        title: '戰鬥用白襪',
        price: 1000,
        sellerName: 'Ricardo',
        sellerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ricardo',
        images: ['https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&q=80&w=300'],
        description: '象徵自由與奔放的靈魂。',
        mode: 'auction',
        endTime: Date.now() + 7200000,
        status: 'active'
    },
    {
        title: '頂級奢華黑絲襪',
        price: 5000,
        sellerName: 'Trump',
        sellerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Trump',
        images: ['https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&q=80&w=300'],
        description: '這不是普通的襪子，這是最好的襪子。',
        mode: 'fixed',
        status: 'active'
    },
    {
        title: '健身專用襪',
        price: 250,
        sellerName: 'Rock',
        sellerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rock',
        images: ['https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&q=80&w=300'],
        description: '健身房必備，耐磨透氣。',
        mode: 'fixed',
        status: 'active'
    },
    {
        title: 'Ugly Beauty 限定襪',
        price: 3000,
        sellerName: 'Jolin',
        sellerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jolin',
        images: ['https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&q=80&w=300'],
        description: '演唱會限定周邊。',
        mode: 'auction',
        endTime: Date.now() + 36000000,
        status: 'active'
    },
    {
        title: 'Neuralink 連接襪',
        price: 800,
        sellerName: 'Elon',
        sellerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elon',
        images: ['https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&q=80&w=300'],
        description: '雖然不能連網，但看起來很有科技感。',
        mode: 'fixed',
        status: 'active'
    }
];

const seedDB = async () => {
    try {
        await Product.deleteMany({});
        // Create a dummy user for seller ref
        let seller = await User.findOne({ email: 'seed@example.com' });
        if (!seller) {
            seller = await User.create({
                username: 'SeedSeller',
                email: 'seed@example.com',
                password: 'password123',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=seed'
            });
        }

        // Add seller ID to products
        const productsWithSeller = seedProducts.map(p => ({
            ...p,
            seller: seller._id
        }));

        await Product.insertMany(productsWithSeller);
        console.log('✅ Database Seeded Successfully!');
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

seedDB();
