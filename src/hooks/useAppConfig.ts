import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { AppConfig, DbSize, DbBackgroundColor, DbFrameColor, DbMockupVariant } from "@/lib/configTypes";

// Fallbacks matching current hardcoded values
const fallbackSizes: DbSize[] = [
  { id: "20x30", size: "20x30", label: "Discreto", price: 49.9, promo_price: 39.9, discount: 20, bg_img: null, display_order: 1 },
  { id: "30x40", size: "30x40", label: "Equilibrado", price: 74.9, promo_price: 59.9, discount: 20, bg_img: null, display_order: 2 },
  { id: "40x50", size: "40x50", label: "Impactante", price: 99.9, promo_price: 79.9, discount: 20, bg_img: null, display_order: 3 },
  { id: "70x50", size: "70x50", label: "Marcante", price: 124.9, promo_price: 99.9, discount: 20, bg_img: null, display_order: 4 },
];

const fallbackBackgroundColors: DbBackgroundColor[] = [
  { name: "azul", hex: "#4A7FB5", display_order: 1 },
  { name: "amarelo", hex: "#E8C840", display_order: 2 },
  { name: "taupe", hex: "#B8A99A", display_order: 3 },
  { name: "rosa", hex: "#E8A0BF", display_order: 4 },
  { name: "laranja", hex: "#E8813A", display_order: 5 },
  { name: "cinza", hex: "#9CA3AF", display_order: 6 },
];

const fallbackFrameColors: DbFrameColor[] = [
  { id: "preto", name: "Preto", prefix: "preto", hex: "#1a1a1a", display_order: 1 },
  { id: "branco", name: "Branco", prefix: "branco", hex: "#ffffff", display_order: 2 },
];

const fallbackConfig: AppConfig = {
  sizes: fallbackSizes,
  backgroundColors: fallbackBackgroundColors,
  frameColors: fallbackFrameColors,
  mockupVariants: [],
};

export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [fetchError, setFetchError] = useState<{ message: string; statusCode?: number } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchConfig() {
      if (!supabase) {
        setConfig(fallbackConfig);
        setOffline(true);
        setLoading(false);
        return;
      }

      try {
        const [sizesRes, bgRes, frameRes, mockupRes] = await Promise.all([
          supabase.from("sizes").select("id, size, label, price, promo_price, discount, bg_img, display_order").eq("active", true).order("display_order", { ascending: true }),
          supabase.from("background_colors").select("name, hex, display_order").eq("active", true).order("display_order", { ascending: true }),
          supabase.from("frame_colors").select("id, name, prefix, hex, display_order").eq("active", true).order("display_order", { ascending: true }),
          supabase.from("mockup_variants").select("size, frame_prefix, background_name, image_url").eq("active", true),
        ]);

        const hasError = sizesRes.error || bgRes.error || frameRes.error || mockupRes.error;

        if (hasError) {
          const firstErr = sizesRes.error || bgRes.error || frameRes.error || mockupRes.error;
          console.warn("Supabase fetch error, using fallback", { sizesRes, bgRes, frameRes, mockupRes });
          if (!cancelled) {
            setConfig(fallbackConfig);
            setOffline(true);
            setFetchError({ message: firstErr?.message || "Unknown error", statusCode: (firstErr as any)?.code });
          }
        } else {
          if (!cancelled) {
            setConfig({
              sizes: (sizesRes.data as DbSize[]) || fallbackSizes,
              backgroundColors: (bgRes.data as DbBackgroundColor[]) || fallbackBackgroundColors,
              frameColors: (frameRes.data as DbFrameColor[]) || fallbackFrameColors,
              mockupVariants: (mockupRes.data as DbMockupVariant[]) || [],
            });
          }
        }
      } catch (err: any) {
        console.warn("Supabase fetch failed, using fallback", err);
        if (!cancelled) {
          setConfig(fallbackConfig);
          setOffline(true);
          setFetchError({ message: err?.message || String(err) });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchConfig();
    return () => { cancelled = true; };
  }, []);

  return { config: config || fallbackConfig, loading, offline, fetchError };
}
