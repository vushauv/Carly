export type ReferenceItem = {
    id: number;
    value: string;
  };
  
  export type ReferenceDictionary = {
    id: number;
    name: string; // CAR_BRANDS, CAR_COLORS, etc
    values: ReferenceItem[];
  };