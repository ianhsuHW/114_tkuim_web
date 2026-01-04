import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    return (
        <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden hover:scale-105 transition transform duration-200">
            <img
                src={product.image?.startsWith('http') ? product.image : `http://localhost:5000${product.image || ''}`}
                alt={product.title}
                className="w-full h-48 object-cover"
            />
            <div className="p-4">
                <h2 className="text-xl font-bold mb-2 truncate">{product.title}</h2>
                <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm px-2 py-1 rounded ${product.mode === 'auction' ? 'bg-amber-600' : 'bg-emerald-600'}`}>
                        {product.mode === 'auction' ? '拍賣' : '直購'}
                    </span>
                    <span className="text-xl font-bold text-indigo-400">NT$ {product.price}</span>
                </div>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>

                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                    <img src={product.sellerId?.avatar || 'https://via.placeholder.com/30'} alt="Seller" className="w-6 h-6 rounded-full" />
                    <span>{product.sellerId?.username}</span>
                </div>

                <Link
                    to={`/products/${product._id}`}
                    className="block w-full text-center bg-slate-700 py-2 rounded hover:bg-slate-600 transition"
                >
                    查看詳情
                </Link>
            </div>
        </div>
    );
};

export default ProductCard;
