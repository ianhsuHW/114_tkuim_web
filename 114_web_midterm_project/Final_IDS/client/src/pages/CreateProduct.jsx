import { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const CreateProduct = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        mode: 'fixed',
        endTime: ''
    });
    const [image, setImage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('mode', formData.mode);
        if (formData.mode === 'auction') {
            data.append('endTime', formData.endTime);
        }
        if (image) {
            data.append('image', image);
        }

        try {
            await api.post('/products', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            navigate('/');
        } catch (err) {
            alert('Failed to create product');
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10">
            <h1 className="text-3xl font-bold mb-8 text-center">上架新商品</h1>
            <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded shadow-lg space-y-6">
                <div>
                    <label className="block mb-2">標題</label>
                    <input
                        type="text"
                        className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label className="block mb-2">描述</label>
                    <textarea
                        className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none h-32"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                    ></textarea>
                </div>

                <div>
                    <label className="block mb-2">圖片</label>
                    <input
                        type="file"
                        onChange={(e) => setImage(e.target.files[0])}
                        className="w-full p-2 bg-slate-700 rounded"
                        accept="image/*"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2">銷售模式</label>
                        <select
                            className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none"
                            value={formData.mode}
                            onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                        >
                            <option value="fixed">直購 (Fixed Price)</option>
                            <option value="auction">拍賣 (Auction)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2">{formData.mode === 'fixed' ? '直購價' : '起標價'}</label>
                        <input
                            type="number"
                            className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                        />
                    </div>
                </div>

                {formData.mode === 'auction' && (
                    <div>
                        <label className="block mb-2">結標時間</label>
                        <input
                            type="datetime-local"
                            className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none"
                            value={formData.endTime}
                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            required
                        />
                    </div>
                )}

                <button className="w-full bg-indigo-600 py-3 rounded font-bold hover:bg-indigo-700 transition">
                    上架商品
                </button>
            </form>
        </div>
    );
};

export default CreateProduct;
