import React, { useMemo, useState } from 'react';
import { Product } from '../../../types';
import { 
  Package, 
  Zap, 
  Building2, 
  Users, 
  Layers, 
  ShoppingBag, 
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { formatCurrency } from '../../../lib/storage';
import { motion, AnimatePresence } from 'motion/react';

export interface SmartBundle {
  id: string;
  type: 'B2B' | 'B2C' | 'P2B' | 'P2C';
  name: string;
  items: Product[];
  originalPrice: number;
  bundlePrice: number;
  discountPercentage: number;
  tagline: string;
  businessDetails: string;
}

const t = {
  en: {
    b2b: "B2B Enterprise Wholesale",
    b2c: "B2C Consumer Combo",
    p2b: "P2B Partner Solution",
    p2c: "P2C Factory-Direct",
    buyAll: (count: number, price: string) => `Buy all (${count}) items by TSh ${price}`,
    saveAmount: (amount: string) => `Save TSh ${amount} instantly`,
    procureBtn: "Inspect Business Combo",
    procuring: "Routing Order...",
    successToast: "Ecosystem package successfully queued into your procurement cart!",
    viewProduct: "Inspect details",
    bulkResell: "Bulk wholesale tier with tax invoice support",
    directProducer: "Bypassing intermediate markup - 100% direct",
    retailSaver: "Premium everyday combo for immediate utility",
    synergyPartner: "Joint peer-to-business vendor synergy package",
    standardTotal: "Standard Total:",
    inStock: "Package Available",
    saving: "You Save"
  },
  sw: {
    b2b: "B2B Ununuzi wa Jumla",
    b2c: "B2C Kifurushi cha Wateja",
    p2b: "P2B Ushirikiano wa Biashara",
    p2c: "P2C Moja kwa Moja Kiwandani",
    buyAll: (count: number, price: string) => `Nunua zote (${count}) kwa TSh ${price}`,
    saveAmount: (amount: string) => `Okoa TSh ${amount} papo hapo`,
    procureBtn: "Gundua Ofa ya Kifurushi",
    procuring: "Tunasafirisha Bidhaa...",
    successToast: "Mkusanyiko wa bidhaa za kibiashara umeongezwa kwenye kikapu chako!",
    viewProduct: "Angalia sifa",
    bulkResell: "Kiwango cha ununuzi wa jumla kikiwa na risiti rasmi",
    directProducer: "Kupita madalali wote - bei halisi ya kiwandani",
    retailSaver: "Ofa bora ya matumizi ya nyumbani kwa gharama nafuu",
    synergyPartner: "Kifurushi kilichoratibiwa na wauzaji washirika",
    standardTotal: "Jumla ya Kawaida:",
    inStock: "Kifurushi Kipo",
    saving: "Unaokoa"
  }
};

/**
 * Generates unique bundles with different products only (no duplicate products in a bundle).
 */
export function generateSmartBundles(
  products: Product[],
  lang: 'sw' | 'en' = 'en',
  selectedNiche?: string,
  selectedFamily?: string
): SmartBundle[] {
  if (!products || products.length === 0) return [];

  // Filter available active pool
  const pool = products.filter(p => p.stock > 0 && p.price > 0);
  if (pool.length < 2) return [];

  // Filter pool based on selected Niche and selected Family
  let targetPool = [...pool];
  
  if (selectedFamily) {
    targetPool = targetPool.filter(p => p.family?.toLowerCase() === selectedFamily.toLowerCase());
  } else if (selectedNiche && selectedNiche !== "Zote") {
    targetPool = targetPool.filter(p => p.niche?.toLowerCase() === selectedNiche.toLowerCase());
  }
  
  // If we have fewer than 2 distinct items, backfill from other products to make sure we always have enough to pair
  if (targetPool.length < 2) {
    targetPool = [...pool];
  }

  // Remove duplicates from target pool to guarantee strictly distinct products in the same bundle
  const distinctPool: Product[] = [];
  const seenIds = new Set<string>();
  for (const p of targetPool) {
    if (!seenIds.has(p.id)) {
      seenIds.add(p.id);
      distinctPool.push(p);
    }
  }

  // If even global distinct pool is less than 2, cannot build a bundle
  if (distinctPool.length < 2) return [];

  const bundles: SmartBundle[] = [];

  // 1. B2C Consumer Combo (2 distinct products)
  if (distinctPool.length >= 2) {
    const items = [distinctPool[0], distinctPool[1]];
    const originalPrice = items[0].price + items[1].price;
    const discountPercentage = 12;
    const bundlePrice = Math.round(originalPrice * (1 - discountPercentage / 100));
    
    bundles.push({
      id: `b2c-${items[0].id}-${items[1].id}`,
      type: "B2C",
      name: lang === 'sw' 
        ? `Kifurushi cha Kisasa cha ${items[0].family || selectedFamily || 'Rejareja'}` 
        : `Premium ${items[0].family || selectedFamily || 'Retail'} Lifestyle Combo`,
      items,
      originalPrice,
      bundlePrice,
      discountPercentage,
      tagline: lang === 'sw' ? t.sw.retailSaver : t.en.retailSaver,
      businessDetails: lang === 'sw' 
        ? "Imesanifiwa kwa ajili ya matumizi ya nyumbani au binafsi. Nunua bidhaa hizi mbili thabiti kwa pamoja uokoe gharama zaidi."
        : "Curated everyday consumer pairing offering immediate lifestyle synergy. Procure both premium products together with an instant pricing advantage."
    });
  }

  // 2. B2B Enterprise Wholesale Pack (3 distinct products if available, or 2 if not)
  if (distinctPool.length >= 2) {
    const hasThree = distinctPool.length >= 3;
    const items = hasThree ? [distinctPool[0], distinctPool[1], distinctPool[2]] : [distinctPool[0], distinctPool[1]];
    const originalPrice = items.reduce((sum, item) => sum + item.price, 0);
    const discountPercentage = 20; // Enterprise wholesale discount
    const bundlePrice = Math.round(originalPrice * (1 - discountPercentage / 100));

    bundles.push({
      id: `b2b-wholesale-${items.map(i => i.id).join('-')}`,
      type: "B2B",
      name: lang === 'sw'
        ? `Kifurushi cha Biashara cha ${selectedNiche || 'Jumla'}`
        : `B2B Enterprise Wholesale Collection`,
      items,
      originalPrice,
      bundlePrice,
      discountPercentage,
      tagline: lang === 'sw' ? t.sw.bulkResell : t.en.bulkResell,
      businessDetails: lang === 'sw'
        ? "Ufumbuzi thabiti wa kiwango cha kibiashara kwa wauzaji wa jumla. Bidhaa mchanganyiko zilizoagizwa moja kwa moja ili kukuza ufanisi wa biashara yako."
        : "High-yield multi-product suite optimized for merchants, B2B vendors, and reselling pools to enhance localized commercial capacity."
    });
  }

  // 3. P2C / P2B Partner Synergy Pack (2 distinct products from either same seller or different sellers)
  if (distinctPool.length >= 2) {
    // Let's grab the last two items in the distinct pool to avoid repeating the exact same pairs as bundle 1
    const idx1 = distinctPool.length - 1;
    const idx2 = Math.max(0, distinctPool.length - 2);
    const items = [distinctPool[idx1], distinctPool[idx2]];
    const originalPrice = items[0].price + items[1].price;
    const discountPercentage = 15;
    const bundlePrice = Math.round(originalPrice * (1 - discountPercentage / 100));

    const isDifferentSellers = items[0].sellerId !== items[1].sellerId;
    const type = isDifferentSellers ? "P2B" : "P2C";

    bundles.push({
      id: `${type.toLowerCase()}-${items[0].id}-${items[1].id}`,
      type,
      name: lang === 'sw'
        ? (type === "P2B" ? "Kifurushi cha Ushirikiano wa Biashara (P2B)" : "Kifurushi Moja kwa Moja cha Kiwandani (P2C)")
        : (type === "P2B" ? "P2B Multi-Vendor Synergy Pack" : "P2C Factory-to-Business Direct Solution"),
      items,
      originalPrice,
      bundlePrice,
      discountPercentage,
      tagline: lang === 'sw' ? t.sw.synergyPartner : t.en.synergyPartner,
      businessDetails: lang === 'sw'
        ? "Ushirikiano wa kimkakati unaopitisha madalali wa kati na kuleta bidhaa mbili bora kwa gharama iliyopunguzwa ya usafirishaji."
        : "Strategic inventory alliance routing distinct high-demand assets together, minimizing middleman markups for optimal value delivery."
    });
  }

  return bundles.slice(0, 3);
}

export const ClientSmartBundleCard = ({ 
  bundle, 
  lang = 'en',
  onSelectProduct,
  onAddToCart,
  products,
  onSelectBundle
}: { 
  bundle: SmartBundle,
  lang?: 'sw' | 'en',
  onSelectProduct: (p: Product) => void,
  onAddToCart: (p: Product, openCart?: boolean, quantity?: number) => void,
  products: Product[],
  onSelectBundle?: (bundle: SmartBundle) => void
}) => {
  const badgeStyles = 
    bundle.type === "B2B" ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
    bundle.type === "B2C" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
    bundle.type === "P2B" ? "bg-amber-50 text-amber-700 border-amber-100" :
    "bg-cyan-50 text-cyan-700 border-cyan-100";

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSelectBundle) {
      onSelectBundle(bundle);
    }
  };

  return (
    <motion.div 
      onClick={handleCardClick}
      className="orbi-market-product-card group flex h-full cursor-pointer flex-col overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400 hover:shadow-md relative"
      whileTap={{ scale: 0.98, transition: { duration: 0.12 } }}
    >
      {/* Upper image stage: beautifully showing the component product thumbnails together */}
      <div className="orbi-product-image-stage relative aspect-[1/1.02] bg-slate-50/50 p-4 flex flex-col justify-center border-b border-slate-100 overflow-hidden">
        
        {/* Type & Discount absolute badges */}
        <div className="absolute left-2.5 top-2.5 z-20 flex flex-wrap gap-1">
          <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeStyles}`}>
            {bundle.type} Ready
          </span>
          <span className="bg-rose-50 border border-rose-100 text-rose-700 text-[8px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse">
            -{bundle.discountPercentage}%
          </span>
        </div>

        {/* Stack of product thumbnails layout */}
        <div className="flex items-center justify-center gap-2 mt-4 relative z-10 w-full h-[110px]">
          {bundle.items.map((item, idx) => (
            <div 
              key={item.id} 
              onClick={(e) => {
                e.stopPropagation();
                onSelectProduct(item);
              }}
              className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200/80 bg-white p-1 shadow-xs hover:border-indigo-400 hover:scale-105 transition-all cursor-pointer relative group-hover/thumb:shadow-md"
              title={t[lang].viewProduct}
            >
              <img 
                src={item.images?.[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500"} 
                alt={item.name} 
                className="w-full h-full object-cover rounded-lg"
              />
              <span className="absolute bottom-0.5 right-0.5 bg-slate-900/80 text-white text-[7px] font-bold px-1 rounded">
                #{idx + 1}
              </span>
            </div>
          ))}
        </div>

        {/* Dynamic greeting box */}
        <div className="text-center mt-2 px-1">
          <p className="text-[10px] font-black text-indigo-600/90 tracking-wide uppercase">
            {t[lang].buyAll(bundle.items.length, formatCurrency(bundle.bundlePrice))}
          </p>
          <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
            {bundle.tagline}
          </span>
        </div>
      </div>

      {/* Card Info section */}
      <div className="flex flex-1 flex-col justify-between gap-3 p-3.5 bg-white">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
              {t[lang][bundle.type.toLowerCase() as 'b2b'|'b2c'|'p2b'|'p2c']}
            </span>
            <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-emerald-600">
              <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
              {t[lang].inStock}
            </span>
          </div>

          <h3 className="text-[12px] font-black leading-snug text-slate-950 transition-colors group-hover:text-indigo-600 min-h-[34px] line-clamp-2">
            {bundle.name}
          </h3>

          <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2 min-h-[28px]">
            {bundle.businessDetails}
          </p>

          <div className="pt-2 border-t border-slate-50">
            <div className="flex items-baseline justify-between gap-1.5 flex-wrap">
              <div className="text-slate-900 font-black text-sm">
                TSh {formatCurrency(bundle.bundlePrice)}
              </div>
              <div className="text-slate-400 line-through text-[10px] font-medium">
                TSh {formatCurrency(bundle.originalPrice)}
              </div>
            </div>
            <div className="text-[8.5px] font-bold text-rose-600 mt-0.5 uppercase tracking-wider">
              🎁 {t[lang].saving}: TSh {formatCurrency(bundle.originalPrice - bundle.bundlePrice)}
            </div>
          </div>
        </div>

        {/* Bottom procurement CTA action trigger */}
        <div className="pt-2">
          <button 
            type="button"
            onClick={handleCardClick}
            className="w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 active:scale-97 shadow-xs hover:shadow-md"
          >
            <Building2 size={11} />
            {t[lang].procureBtn}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const ClientSmartBundles = ({ 
  products, 
  lang = 'en',
  selectedNiche,
  selectedFamily,
  onSelectProduct,
  onAddToCart
}: { 
  products: Product[],
  lang?: 'sw' | 'en',
  selectedNiche?: string,
  selectedFamily?: string,
  onSelectProduct: (p: Product) => void,
  onAddToCart: (p: Product, openCart?: boolean, quantity?: number) => void
}) => {
  // Return null or empty div since the parent will mix bundles inside the product list grid directly.
  return null;
};
