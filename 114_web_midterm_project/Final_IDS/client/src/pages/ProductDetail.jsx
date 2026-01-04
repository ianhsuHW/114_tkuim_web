import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bidAmount, setBidAmount] = useState('');
    const [timeLeft, setTimeLeft] = useState('');
    const socketRef = useRef();

    useEffect(() => {
        // Socket.io connection
        socketRef.current = io('http://localhost:5000');
        socketRef.current.emit('joinProduct', id);

        socketRef.current.on('bid:update', (data) => {
            setProduct(prev => ({
                ...prev,
                price: data.price,
                bids: [data.lastBid, ...(prev.bids || [])] // Optimistically update or fetch? Simpler to just update price
            }));
            // Ideally we should refetch or push the bid to a list if we display bid history
            // For now just update price
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [id]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/products/${id}`);
                setProduct(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    useEffect(() => {
        if (product && product.mode === 'auction' && product.endTime) {
            const interval = setInterval(() => {
                const now = new Date();
                const end = new Date(product.endTime);
                if (now >= end) {
                    setTimeLeft('已結束');
                    clearInterval(interval);
                } else {
                    setTimeLeft(formatDistanceToNow(end, { locale: zhTW, addSuffix: true }));
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [product]);

    const handlePlaceBid = async () => {
        if (!user) return navigate('/login');
        if (Number(bidAmount) <= product.price) {
            alert('出價必須高於目前價格');
            return;
        }

        try {
            await api.post(`/bids/${id}`, { amount: Number(bidAmount) });
            setBidAmount('');
            alert('出價成功！');
        } catch (err) {
            alert(err.response?.data?.message || '出價失敗');
        }
    };

    const handleBuyNow = async () => {
        if (!user) return navigate('/login');
        if (!confirm('確定要購買此商品嗎？')) return;

        try {
            await api.post('/orders', { productId: id });
            alert('購買成功！');
            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.message || '購買失敗');
        }
    };

    if (loading) return <div>載入中...</div>;
    if (!product) return <div>商品不存在</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-10">
            <div className="bg-slate-800 rounded-lg overflow-hidden shadow-xl">
                <img
                    src={product.image?.startsWith('http') ? product.image : `http://localhost:5000${product.image || ''}`}
                    alt={product.title}
                    className="w-full h-96 object-cover"
                />
            </div>

            <div className="space-y-6">
                <h1 className="text-4xl font-bold">{product.title}</h1>

                <div className="flex items-center space-x-4">
                    <img src={product.sellerId?.avatar || 'https://via.placeholder.com/40'} alt="Seller" className="w-10 h-10 rounded-full" />
                    <div>
                        <p className="font-semibold">{product.sellerId?.username}</p>
                        <p className="text-sm text-gray-400">{product.sellerId?.bio || '這位賣家很懶，什麼都沒寫'}</p>
                    </div>
                </div>

                <p className="text-gray-300 leading-relaxed text-lg">{product.description}</p>

                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-400">目前價格</span>
                        <span className="text-3xl font-bold text-indigo-400">NT$ {product.price}</span>
                    </div>

                    {product.isSold ? (
                        <div className="bg-red-600 text-white text-center py-3 rounded font-bold">
                            已售出
                        </div>
                    ) : (
                        <>
                            {product.mode === 'auction' ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between text-amber-400 font-bold">
                                        <span>剩餘時間</span>
                                        <span>{timeLeft}</span>
                                    </div>
                                    {user?.role === 'buyer' && (
                                        <div className="flex space-x-2">
                                            <input
                                                type="number"
                                                className="flex-1 p-2 rounded bg-slate-700 border border-slate-600 text-white"
                                                placeholder={`出價 > ${product.price}`}
                                                value={bidAmount}
                                                onChange={(e) => setBidAmount(e.target.value)}
                                            />
                                            <button
                                                onClick={handlePlaceBid}
                                                className="bg-amber-600 px-6 py-2 rounded font-bold hover:bg-amber-700 transition"
                                            >
                                                出價
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                user?.role === 'buyer' && (
                                    <button
                                        onClick={handleBuyNow}
                                        className="w-full bg-emerald-600 py-3 rounded font-bold hover:bg-emerald-700 transition"
                                    >
                                        立即購買
                                    </button>
                                )
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
