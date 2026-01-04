import { useEffect, useState } from 'react';
import api from '../utils/api';

const Leaderboard = () => {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get('/auth/leaderboard');
                setSellers(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) return <div>載入中...</div>;

    return (
        <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-10 text-amber-400">🏆 銷售排行榜</h1>

            <div className="space-y-4">
                {sellers.map((entry, index) => (
                    <div key={entry._id._id} className="bg-slate-800 p-6 rounded-lg flex items-center justify-between shadow-lg transform hover:scale-105 transition">
                        <div className="flex items-center space-x-6">
                            <span className={`text-3xl font-bold w-12 ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-400' : 'text-slate-600'}`}>
                                #{index + 1}
                            </span>
                            <img src={entry._id.avatar || 'https://via.placeholder.com/50'} alt="" className="w-16 h-16 rounded-full border-2 border-indigo-500" />
                            <div className="text-left">
                                <h3 className="text-xl font-bold">{entry._id.username}</h3>
                                <p className="text-gray-400 text-sm line-clamp-1">{entry._id.bio}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-emerald-400">NT$ {entry.totalRevenue}</p>
                            <p className="text-gray-500 text-sm">{entry.totalSales} 筆訂單</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leaderboard;
