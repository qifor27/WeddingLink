import type { Skin } from "./skin";
import { skin as blueButterfly } from "./blue-butterfly/skin";
import { skin as goldBlush } from "./gold-blush/skin";
import { skin as minangPastel } from "./minang-pastel/skin";
import { skin as redBeige } from "./red-beige/skin";
import { skin as sundaMinang } from "./sunda-minang/skin";

// Skin per slug. Tema tanpa skin memakai tampilan base (components/sections/base.css).
export const skins: Record<string, Skin | undefined> = {
  "blue-butterfly": blueButterfly,
  "gold-blush": goldBlush,
  "minang-pastel": minangPastel,
  "red-beige": redBeige,
  "sunda-minang": sundaMinang,
};
