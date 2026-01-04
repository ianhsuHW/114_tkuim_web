import { useEffect, useState } from 'react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get('/products');
                setProducts(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p => filter === 'all' ? true : p.mode === filter);

    if (loading) return <div className="text-center py-10">載入中...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">最新商品</h1>
                <div className="space-x-2">
                    <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-indigo-600' : 'bg-slate-700'}`}>全部</button>
                    <button onClick={() => setFilter('fixed')} className={`px-4 py-2 rounded ${filter === 'fixed' ? 'bg-indigo-600' : 'bg-slate-700'}`}>直購</button>
                    <button onClick={() => setFilter('auction')} className={`px-4 py-2 rounded ${filter === 'auction' ? 'bg-indigo-600' : 'bg-slate-700'}`}>拍賣</button>
                </div>
            </div>

            {filteredProducts.length === 0 ? (
                <p className="text-center text-gray-500">暫無商品</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredProducts.map(product => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
