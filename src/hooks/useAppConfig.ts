import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AppConfig, DbSize, DbBackgroundColor, DbFrameColor, DbMockupVariant } from "@/lib/configTypes";

// Fallbacks matching current hardcoded values
const fallbackSizes: DbSize[] = [
  { size: "20x30", label: "Discreto", name: "20x30", price: 49.9, promo_price: 39.9, discount: 20, bg_img: null, display_order: 1 },
  { size: "30x40", label: "Equilibrado", name: "30x40", price: 74.9, promo_price: 59.9, discount: 20, bg_img: null, display_order: 2 },
  { size: "40x50", label: "Impactante", name: "40x50", price: 99.9, promo_price: 79.9, discount: 20, bg_img: null, display_order: 3 },
  { size: "70x50", label: "Marcante", name: "70x50", price: 124.9, promo_price: 99.9, discount: 20, bg_img: null, display_order: 4 },
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
  { id: 1, name: "Preto", prefix: "preto", hex: "#1a1a1a", display_order: 1, display_name_pt: "Preta" },
  { id: 2, name: "Branco", prefix: "branco", hex: "#ffffff", display_order: 2, display_name_pt: "Branca" },
];

const FALLBACK_WHATSAPP = "+351913954511";

const fallbackConfig: AppConfig = {
  sizes: fallbackSizes,
  backgroundColors: fallbackBackgroundColors,
  frameColors: fallbackFrameColors,
  mockupVariants: [],
  supportWhatsapp: FALLBACK_WHATSAPP,
};

export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [fetchError, setFetchError] = useState<{ message: string; statusCode?: number } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchConfig() {
    // supabase client from integrations is always defined

      try {
        const [sizesRes, bgRes, frameRes, mockupRes, settingsRes] = await Promise.all([
          supabase.from("sizes").select("size, label, name, price, promo_price, discount, bg_img, display_order").eq("active", true).order("display_order", { ascending: true }),
          supabase.from("background_colors").select("name, hex, display_order").eq("active", true).order("display_order", { ascending: true }),
          supabase.from("frame_colors").select("id, name, prefix, hex, display_order, display_name_pt").eq("active", true).order("display_order", { ascending: true }),
          supabase.from("mockup_variants").select("size, frame_prefix, background_name, image_url").eq("active", true),
          supabase.from("builder_settings").select("value").eq("key", "support_whatsapp").limit(1).maybeSingle(),
        ]);

        const whatsappNumber = settingsRes?.data?.value || FALLBACK_WHATSAPP;
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
              supportWhatsapp: whatsappNumber,
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
