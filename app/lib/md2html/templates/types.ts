export interface TemplateVariant {
  swatch: string[];
  css: string;
}

export interface MdTemplate {
  id: string;
  emoji: string;
  nameZh: string;
  nameEn: string;
  descZh: string;
  descEn: string;
  swatch: string[];
  css: string;
  variants?: TemplateVariant[];
}
