export * from "./routes";
export const dateFormat = "yyyy-MM-dd";
export const timeFormat = "T";
export const oneMinuteInMillis = 60000;
export const textDefault = {
  sizeVminRatio: 1.8,
  minREMSize: 1,
  maxREMSize: 2.5,
};
export const everyMinuteSchedule = "0 * * * * *";

export const schemaURLs = {
  settings: `${window.location.origin}/schemas/settings/v0.1.0/schema.json`,
};
