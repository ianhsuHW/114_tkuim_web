import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(formData.email, formData.password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || '登入失敗，請稍後再試');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center py-20 px-4">
            <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-lg shadow-2xl w-full max-w-md space-y-6 border border-slate-700">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">歡迎回來</h2>
                    <p className="text-slate-400 text-sm">請輸入您的帳號密碼以登入</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded flex items-center gap-2 text-sm">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="space-y-4">
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
                                placeholder="請輸入密碼"
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
                    </div>
                </div>

                <button
                    disabled={loading}
                    className="w-full bg-indigo-600 py-3 rounded font-bold hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
                >
                    {loading ? '登入中...' : '立即登入'}
                </button>

                <p className="text-center text-slate-400 text-sm">
                    還沒有帳號？ <a href="/register" className="text-indigo-400 hover:text-indigo-300">立即註冊</a>
                </p>
            </form>
        </div>
    );
};

export default Login;
