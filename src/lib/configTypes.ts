export interface DbSize {
  size: string;
  label: string;
  name: string;
  price: number;
  promo_price: number | null;
  discount: number | null;
  bg_img: string | null;
  display_order: number;
}

export interface DbBackgroundColor {
  name: string;
  hex: string;
  display_order: number;
}

export interface DbFrameColor {
  id: number;
  name: string;
  prefix: string;
  hex: string;
  display_order: number;
  display_name_pt: string | null;
}

export interface DbMockupVariant {
  size: string;
  frame_prefix: string;
  background_name: string;
  image_url: string;
}

export interface AppConfig {
  sizes: DbSize[];
  backgroundColors: DbBackgroundColor[];
  frameColors: DbFrameColor[];
  mockupVariants: DbMockupVariant[];
  supportWhatsapp: string;
}
