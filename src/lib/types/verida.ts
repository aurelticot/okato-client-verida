export type UserProfile = {
  id: string;
  name?: string;
  avatar?: string;
};

export type SettingsRecord = {
  _id: string;
  _rev: string;
  theme: "system" | "black" | "dark" | "light" | "white";
  language: string;
  timeFormat: "system" | "12-hour" | "24-hour";
  marketSort:
    | "ALPHABETICALLY"
    | "ALPHABETICALLY_REVERSE"
    | "CAPITALISATION"
    | "CAPITALISATION_REVERSE"
    | "CHRONOLOGICALLY"
    | "CHRONOLOGICALLY_REVERSE";
  marketSelection: string[];
};
