import { cardBlockComponents } from "./content/card-blocks";
import { dataBlockComponents } from "./content/data-blocks";
import { socialBlockComponents } from "./content/social-blocks";

export const contentComponents = {
  ...cardBlockComponents,
  ...dataBlockComponents,
  ...socialBlockComponents,
};
