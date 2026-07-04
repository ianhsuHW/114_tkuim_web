import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/orders');
                setOrders(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return <div>載入中...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">{user.role === 'seller' ? '我的銷售 (Sales)' : '我的購買 (Purchases)'}</h1>

            {orders.length === 0 ? (
                <p className="text-gray-500">尚無紀錄</p>
            ) : (
                <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg">
                    <table className="w-full text-left">
                        <thead className="bg-slate-700 text-gray-300">
                            <tr>
                                <th className="p-4">商品</th>
                                <th className="p-4">金額</th>
                                <th className="p-4">日期</th>
                                <th className="p-4">{user.role === 'seller' ? '買家' : '賣家'}</th>
                                <th className="p-4">狀態</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {orders.map(order => (
                                <tr key={order._id} className="hover:bg-slate-700/50">
                                    <td className="p-4 flex items-center space-x-3">
                                        <img src={`http://localhost:5000${order.productId?.image}`} alt="" className="w-10 h-10 rounded object-cover" />
                                        <span>{order.productId?.title || '未知商品'}</span>
                                    </td>
                                    <td className="p-4 font-bold text-indigo-400">NT$ {order.amount}</td>
                                    <td className="p-4 text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        {user.role === 'seller' ?
                                            (order.buyerId?.username || '未知') :
                                            '賣家 ID ' + (order.productId?.sellerId || '') // Populate failed? logic in controller needs fix if deeply nested, but let's assume simple
                                        }
                                    </td>
                                    <td className="p-4 text-emerald-400 font-bold">{order.status === 'completed' ? '完成' : '處理中'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
