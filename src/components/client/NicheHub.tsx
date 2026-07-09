import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Niche, Product } from '../../types';
import { ChevronRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface NicheHubProps {
  niches: Niche[];
  products: Product[];
  lang: string;
  onSelectNiche: (nicheName: string) => void;
  nicheColorMap?: Record<string, { 
    hue: number; 
    textClass: string; 
    bgClass: string; 
    hoverBgClass: string; 
    borderClass: string; 
    gradientClass: string; 
    bannerBgClass: string; 
    css: string; 
  }>;
}

function slugifyNiche(name: string): string {
  if (!name) return "";
  return name.toLowerCase()
    .replace(/ & /g, "-")
    .replace(/ /g, "-")
    .replace(/[^\w-]/g, "");
}

const getStringHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

interface NicheProductPreviewGridProps {
  products: Product[];
  lang: string;
  nicheName: string;
}

export function NicheProductPreviewGrid({ products, lang, nicheName }: NicheProductPreviewGridProps) {
  const nicheProducts = useMemo(() => {
    return products.filter(p => p.niche === nicheName);
  }, [products, nicheName]);

  // We want to show 4 slots
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);

  // Set initial products on mount or products change
  useEffect(() => {
    setDisplayedProducts(nicheProducts.slice(0, 4));
  }, [nicheProducts]);

  useEffect(() => {
    if (nicheProducts.length <= 4) return;

    // Auto-cycle one slot at a time with a randomized interval to create a natural feeling across different cards
    const intervalId = setInterval(() => {
      setDisplayedProducts(current => {
        if (current.length === 0) return nicheProducts.slice(0, 4);
        
        // Get all products that are NOT currently displayed in the 4 slots
        const currentIds = new Set(current.map(p => p.id));
        const pool = nicheProducts.filter(p => !currentIds.has(p.id));
        
        if (pool.length === 0) return current;

        // Choose a random slot (0 to 3) to replace
        const slotToReplace = Math.floor(Math.random() * Math.min(4, current.length));
        // Choose a random product from the pool
        const newProduct = pool[Math.floor(Math.random() * pool.length)];

        const next = [...current];
        next[slotToReplace] = newProduct;
        return next;
      });
    }, 3200 + Math.random() * 2500); // Ticked at offset intervals between 3.2 and 5.7s

    return () => clearInterval(intervalId);
  }, [nicheProducts]);

  if (nicheProducts.length === 0) {
    return (
      <div className="h-28 bg-slate-50/50 rounded-2xl mt-3 flex flex-col items-center justify-center text-slate-400 border border-slate-100 border-dashed">
        <LucideIcons.PackageOpen size={20} className="mb-1 opacity-50" />
        <span className="text-[11px] font-medium">{lang === "sw" ? "Hakuna bidhaa bado" : "No products yet"}</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {Array.from({ length: 4 }).map((_, slotIdx) => {
        const p = displayedProducts[slotIdx];
        if (!p) {
          return (
            <div 
              key={`empty-${slotIdx}`} 
              className="aspect-square bg-slate-50/50 rounded-xl border border-slate-100/50 flex items-center justify-center"
            >
              <LucideIcons.Image size={14} className="text-slate-200" />
            </div>
          );
        }

        return (
          <div 
            key={`slot-container-${slotIdx}`} 
            className="aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-100 relative group/img shadow-sm"
          >
            <AnimatePresence>
              {/* Smooth cinematic dynamic image transition */}
              <motion.img 
                key={`slot-${slotIdx}-${p.id}`} 
                src={p.images?.[0] || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80'} 
                alt={p.name}
                referrerPolicy="no-referrer"
                initial={{ opacity: 0, scale: 1.1, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                className="absolute inset-0 w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700"
              />
            </AnimatePresence>
            
            {/* Hover overlay with a sleek modern quick view feel */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
              <span className="text-[9px] font-bold text-white tracking-wider uppercase px-1.5 py-0.5 bg-white/20 rounded-full backdrop-blur-[2px]">
                {lang === "sw" ? "Tazama" : "View"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface NicheCardBackgroundCarouselProps {
  products: Product[];
  nicheName: string;
}

export function NicheCardBackgroundCarousel({ products, nicheName }: NicheCardBackgroundCarouselProps) {
  const images = useMemo(() => {
    const nicheProducts = products.filter(p => p.niche === nicheName);
    const collectedImages: string[] = [];
    for (const p of nicheProducts) {
      if (p.images && p.images[0]) {
        collectedImages.push(p.images[0]);
      }
      if (collectedImages.length >= 3) break;
    }
    return collectedImages;
  }, [products, nicheName]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % images.length);
    }, 4500 + Math.random() * 2000); // cycle every 4.5-6.5s offset
    return () => clearInterval(interval);
  }, [images]);

  if (images.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-0">
      <AnimatePresence mode="popLayout">
        {images.map((img, idx) => {
          if (idx !== activeIndex) return null;
          return (
            <motion.div
              key={img}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.14 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 overflow-hidden"
            >
              <motion.img
                src={img}
                alt="niche-bg-cycle"
                referrerPolicy="no-referrer"
                initial={{ scale: 1.05, filter: "blur(6px)" }}
                animate={{ scale: 1.15, filter: "blur(3px)" }}
                transition={{ duration: 8, ease: "linear" }}
                className="w-full h-full object-cover saturate-100 contrast-100 brightness-105"
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
      {/* Absolute gradient overlay over the dynamic image to transition beautifully and keep card background clean */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/94 via-white/90 to-white/94 group-hover:from-white/88 group-hover:via-white/82 group-hover:to-white/88 transition-all duration-300" />
    </div>
  );
}

export function NicheHub({ niches, products, lang, onSelectNiche, nicheColorMap }: NicheHubProps) {
  // Filter out Zote/All from niches if it exists
  const displayNiches = niches.filter(n => n.name !== "Zote" && n.name !== "All");

  // Fallback dynamic styles in case nicheColorMap is not provided
  const dynamicStyles = useMemo(() => {
    return displayNiches.map(niche => {
      const hash = getStringHash(niche.name);
      const hue = hash % 360;
      const textClass = `text-hash-${hash}`;
      const bgClass = `bg-hash-${hash}`;
      const borderClass = `border-hash-${hash}`;
      const css = `
        .${textClass} {
          color: hsl(${hue}, 75%, 40%) !important;
        }
        .group:hover .${textClass} {
          color: hsl(${(hue + 25) % 360}, 85%, 45%) !important;
        }
        .${bgClass} {
          background-color: hsl(${hue}, 90%, 97%) !important;
          color: hsl(${hue}, 75%, 40%) !important;
        }
        .group:hover .${bgClass} {
          background-color: hsl(${hue}, 90%, 93%) !important;
          color: hsl(${(hue + 25) % 360}, 85%, 45%) !important;
        }
        .${borderClass} {
          border-color: hsl(${hue}, 45%, 90%) !important;
        }
        .group:hover .${borderClass} {
          border-color: hsl(${hue}, 55%, 82%) !important;
        }
      `;
      return { nicheName: niche.name, textClass, bgClass, borderClass, css, hue };
    });
  }, [displayNiches]);

  const combinedStylesCss = useMemo(() => {
    if (nicheColorMap) {
      return Object.values(nicheColorMap).map(v => v.css).join("\n");
    }
    return dynamicStyles.map(s => s.css).join("\n");
  }, [nicheColorMap, dynamicStyles]);

  const styleMapping = useMemo(() => {
    const map: Record<string, { textClass: string; bgClass: string; borderClass: string; hue: number }> = {};
    dynamicStyles.forEach(s => {
      map[s.nicheName] = { textClass: s.textClass, bgClass: s.bgClass, borderClass: s.borderClass, hue: s.hue };
    });
    return map;
  }, [dynamicStyles]);

  const getStyleClasses = (nicheName: string) => {
    if (nicheColorMap && nicheColorMap[nicheName]) {
      return nicheColorMap[nicheName];
    }
    return styleMapping[nicheName] || { textClass: "", bgClass: "", borderClass: "", hue: 200 };
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 mb-8">
      <style>{combinedStylesCss}</style>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-1.5 tracking-tight">
          {lang === "sw" ? "Ungependa Kununua nini Leo Kutoka Kwetu?" : "What would you like to buy from us today?"}
        </h2>
        <p className="text-slate-500 font-medium text-xs sm:text-sm">
          {lang === "sw" 
            ? "Chagua duka lako maalum kwa uzoefu bora wa ununuzi." 
            : "Choose your dedicated shopping center for the best experience."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {displayNiches.map((niche, index) => {
          // Dynamic Icon Rendering
          const IconComponent = (LucideIcons as any)[niche.icon] || LucideIcons.ShoppingBag;
          const styleInfo = getStyleClasses(niche.name);

          return (
            <motion.a
              key={niche.id || niche.name || `niche-${index}`}
              href={`/niche/${slugifyNiche(niche.name)}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, ease: "easeOut" }}
              onClick={(e) => {
                e.preventDefault();
                onSelectNiche(niche.name);
              }}
              className={`bg-white rounded-2xl p-4 shadow-sm border ${styleInfo.borderClass || 'border-slate-100'} hover:shadow-xl hover:-translate-y-1 hover:border-transparent transition-all duration-300 cursor-pointer group flex flex-col h-full relative overflow-hidden`}
            >
              {/* Dynamic cross-fading product background carousel */}
              <NicheCardBackgroundCarousel products={products} nicheName={niche.name} />

              {/* Header: beautifully compact */}
              <div className="flex items-center gap-2.5 mb-3 z-10 relative">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-300 ${styleInfo.bgClass}`}>
                  <IconComponent size={20} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-base transition-colors line-clamp-1 ${styleInfo.textClass}`}>
                    {niche.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {niche.categories?.length || 0} {lang === "sw" ? "Kategoria" : "Categories"}
                  </p>
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                  <ChevronRight size={14} />
                </div>
              </div>

              {/* Cycling Dynamic Product Previews */}
              <div className="flex-1 z-10 relative mt-auto">
                <NicheProductPreviewGrid 
                  products={products}
                  lang={lang}
                  nicheName={niche.name}
                />
              </div>
              
              {/* Subtle background decoration */}
              <div 
                className="absolute -bottom-8 -right-8 opacity-[0.05] group-hover:opacity-[0.10] group-hover:scale-125 transition-all duration-500 pointer-events-none"
                style={{ color: `hsl(${styleInfo.hue || 200}, 85%, 40%)` }}
              >
                <IconComponent size={120} />
              </div>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}
