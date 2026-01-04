import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-slate-800 p-4 sticky top-0 z-50 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-indigo-400">
                    SocksTrading
                </Link>
                <div className="flex items-center space-x-4">
                    <Link to="/" className="hover:text-indigo-300">首頁</Link>
                    <Link to="/leaderboard" className="hover:text-amber-300">排行榜</Link>
                    {user ? (
                        <>
                            {user.role === 'seller' && (
                                <Link to="/create-product" className="hover:text-indigo-300">上架</Link>
                            )}
                            <Link to="/dashboard" className="flex items-center space-x-2">
                                {user.avatar && <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />}
                                <span className="font-semibold">{user.username}</span>
                            </Link>
                            <button
                                onClick={logout}
                                className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition"
                            >
                                登出
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-indigo-300">登入</Link>
                            <Link to="/register" className="bg-indigo-600 px-3 py-1 rounded hover:bg-indigo-700 transition">
                                註冊
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
