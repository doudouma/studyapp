import { apple } from "./apple";
import { spotify } from "./spotify";
import { ikea } from "./ikea";
import { starbucks } from "./starbucks";
import { tiffany } from "./tiffany";
import { cola } from "./cola";
import { linear } from "./linear";
import { xiaomi } from "./xiaomi";
import { swiss } from "./swiss";
import type { MdTemplate } from "./types";

export type { MdTemplate } from "./types";

export { apple } from "./apple";
export { spotify } from "./spotify";
export { ikea } from "./ikea";
export { starbucks } from "./starbucks";
export { tiffany } from "./tiffany";
export { cola } from "./cola";
export { linear } from "./linear";
export { xiaomi } from "./xiaomi";
export { swiss } from "./swiss";

export const MD_TEMPLATES: MdTemplate[] = [
  apple,
  spotify,
  ikea,
  starbucks,
  tiffany,
  cola,
  linear,
  xiaomi,
  swiss,
];

export function getTemplate(id: string): MdTemplate {
  return MD_TEMPLATES.find((t) => t.id === id) ?? MD_TEMPLATES[0];
}
