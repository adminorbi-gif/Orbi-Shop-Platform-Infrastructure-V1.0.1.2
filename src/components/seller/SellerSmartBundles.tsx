import React, { useState } from 'react';
import { SmartBundle, Product } from '../../types';
import { Plus, Trash2, Save, Package } from 'lucide-react';

export const SellerSmartBundles = ({ 
  sellerId, 
  products, 
  lang 
}: { 
  sellerId: string, 
  products: Product[],
  lang: 'sw' | 'en' 
}) => {
  const [bundles, setBundles] = useState<SmartBundle[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newBundle, setNewBundle] = useState<Partial<SmartBundle>>({
    name: '',
    description: '',
    items: [],
    discountPercentage: 10,
    active: true
  });

  const sellerProducts = products.filter(p => p.sellerId === sellerId);

  const handleSave = async () => {
    if (!newBundle.name || !newBundle.items?.length) return;
    const bundle: SmartBundle = {
      id: `bundle-${Date.now()}`,
      sellerId,
      name: newBundle.name,
      description: newBundle.description,
      items: newBundle.items,
      discountPercentage: newBundle.discountPercentage || 0,
      active: newBundle.active ?? true,
      createdAt: Date.now()
    };
    
    // In a real implementation this would go to DB
    // For now we just update local state
    setBundles([...bundles, bundle]);
    setIsCreating(false);
    setNewBundle({ name: '', description: '', items: [], discountPercentage: 10, active: true });
  };

  const addItem = (productId: string) => {
    if (!productId) return;
    setNewBundle(prev => ({
      ...prev,
      items: [...(prev.items || []), { productId, quantity: 1 }]
    }));
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const newItems = [...(newBundle.items || [])];
    newItems[index].quantity = quantity;
    setNewBundle({ ...newBundle, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = [...(newBundle.items || [])];
    newItems.splice(index, 1);
    setNewBundle({ ...newBundle, items: newItems });
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Package className="text-emerald-500" />
            {lang === 'sw' ? 'Mkusanyiko wa Bidhaa (Smart Bundles)' : 'Smart Bundles'}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {lang === 'sw' ? 'Uza bidhaa kwa pamoja na punguzo maalum.' : 'Group products together for a special discount.'}
          </p>
        </div>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition"
          >
            <Plus className="inline-block w-4 h-4 mr-1" />
            {lang === 'sw' ? 'Tengeneza Mpya' : 'Create New'}
          </button>
        )}
      </div>

      {isCreating ? (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="grid gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{lang === 'sw' ? 'Jina la Mkusanyiko' : 'Bundle Name'}</label>
              <input 
                value={newBundle.name}
                onChange={e => setNewBundle({...newBundle, name: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500"
                placeholder="e.g. Back to School Pack"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{lang === 'sw' ? 'Punguzo (%)' : 'Discount (%)'}</label>
              <input 
                type="number"
                value={newBundle.discountPercentage}
                onChange={e => setNewBundle({...newBundle, discountPercentage: Number(e.target.value)})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-emerald-500"
                min="0" max="100"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 mb-2">{lang === 'sw' ? 'Bidhaa za Kwenye Mkusanyiko' : 'Bundle Items'}</label>
            <div className="space-y-2 mb-3">
              {newBundle.items?.map((item, idx) => {
                const prod = sellerProducts.find(p => p.id === item.productId);
                return (
                  <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-sm font-medium">{prod?.name || 'Unknown'}</span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={item.quantity} 
                        onChange={e => updateItemQuantity(idx, Number(e.target.value))}
                        className="w-16 px-2 py-1 text-center border border-slate-200 rounded"
                        min="1"
                      />
                      <button onClick={() => removeItem(idx)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex gap-2">
              <select 
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 outline-none"
                onChange={e => {
                  addItem(e.target.value);
                  e.target.value = '';
                }}
                defaultValue=""
              >
                <option value="" disabled>{lang === 'sw' ? 'Chagua bidhaa ya kuongeza...' : 'Select product to add...'}</option>
                {sellerProducts.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button 
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition"
            >
              {lang === 'sw' ? 'Ghairi' : 'Cancel'}
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition"
            >
              <Save size={16} />
              {lang === 'sw' ? 'Hifadhi' : 'Save Bundle'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {bundles.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              {lang === 'sw' ? 'Hakuna mikusanyiko bado.' : 'No smart bundles created yet.'}
            </div>
          ) : (
            bundles.map(b => (
              <div key={b.id} className="p-4 rounded-xl border border-slate-200 hover:border-emerald-200 transition">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-900">{b.name}</h4>
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-black">
                    -{b.discountPercentage}%
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  {b.items.map(i => {
                    const p = sellerProducts.find(prod => prod.id === i.productId);
                    return `${i.quantity}x ${p?.name || 'Item'}`;
                  }).join(', ')}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
