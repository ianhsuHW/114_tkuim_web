import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'buyer', avatar: '', bio: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Frontend Validation
        if (formData.password.length < 6) {
            setError('密碼長度不足 (需至少 6 字元)');
            return;
        }

        setLoading(true);
        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            console.error(err);
            if (!err.response) {
                setError('無法連接伺服器，請確認後端與資料庫是否已啟動。(Network Error)');
            } else {
                setError(err.response?.data?.message || '註冊失敗');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center py-10 px-4">
            <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-lg shadow-2xl w-full max-w-md space-y-6 border border-slate-700">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">建立帳號</h2>
                    <p className="text-slate-400 text-sm">加入 SocksTrading 開始交易</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded flex items-center gap-2 text-sm">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-1">使用者名稱</label>
                        <input
                            type="text"
                            placeholder="您的暱稱"
                            className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition text-white"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-1">電子郵件</label>
                        <input
                            type="email"
                            placeholder="user@example.com"
                            className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition text-white"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-1">密碼</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="設定密碼"
                                className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition text-white pr-10"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Password Rules */}
                        <div className="mt-2 space-y-1">
                            <p className="text-xs text-slate-400 font-bold">密碼規則：</p>
                            <div className={`flex items-center space-x-2 text-xs ${formData.password.length >= 6 ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {formData.password.length >= 6 ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                <span>至少 6 個字元</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-1">身分選擇</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'buyer' })}
                                className={`p-3 rounded border text-center transition ${formData.role === 'buyer' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500'}`}
                            >
                                買家
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'seller' })}
                                className={`p-3 rounded border text-center transition ${formData.role === 'seller' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500'}`}
                            >
                                賣家
                            </button>
                        </div>
                    </div>

                    {formData.role === 'seller' && (
                        <div className="p-4 bg-slate-900/50 rounded border border-slate-700 space-y-4 animate-fadeIn">
                            <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider">賣家資料 (選填)</p>
                            <input
                                type="text"
                                placeholder="頭像圖片網址 (URL)"
                                className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-indigo-500 outline-none text-white text-sm"
                                value={formData.avatar}
                                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                            />
                            <textarea
                                placeholder="簡單介紹一下自己..."
                                className="w-full p-3 rounded bg-slate-900 border border-slate-600 focus:border-indigo-500 outline-none text-white text-sm h-24 resize-none"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            ></textarea>
                        </div>
                    )}
                </div>

                <button
                    disabled={loading}
                    className="w-full bg-indigo-600 py-3 rounded font-bold hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
                >
                    {loading ? '註冊中...' : '確認註冊'}
                </button>

                <p className="text-center text-slate-400 text-sm">
                    已經有帳號？ <a href="/login" className="text-indigo-400 hover:text-indigo-300">直接登入</a>
                </p>
            </form>
        </div>
    );
};

export default Register;
