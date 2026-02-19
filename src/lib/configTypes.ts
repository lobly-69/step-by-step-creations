export interface DbSize {
  id: string;
  size: string;
  label: string;
  price: number;
  promo_price: number;
  discount: number;
  bg_img: string | null;
  display_order: number;
}

export interface DbBackgroundColor {
  name: string;
  hex: string;
  display_order: number;
}

export interface DbFrameColor {
  id: string;
  name: string;
  prefix: string;
  hex: string;
  display_order: number;
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
}
