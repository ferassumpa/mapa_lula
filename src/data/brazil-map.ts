import raw from "./brazil-map.js";

export type BrazilLocation = {
  name: string;
  id: string;
  path: string;
};

export type BrazilMapData = {
  label: string;
  viewBox: string;
  locations: BrazilLocation[];
};

const brazilMap = raw as BrazilMapData;

export default brazilMap;
