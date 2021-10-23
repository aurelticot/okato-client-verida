import { SettingKey, UserSettings, MarketSortingMethod } from "lib/types";
import { settings } from "./settings";

const appName = process.env.npm_package_name;

const appVersion = process.env.npm_package_version;

const nodeEnv: string = process.env.NODE_ENV || "production";

const environmentId: string = process.env.REACT_APP_ENVIRONMENT_ID || "unknown";

const graphqlAPIEndpoint = process.env.REACT_APP_GRAPHQL_API_ENDPOINT;

const raygunAPIKey = process.env.REACT_APP_RAYGUN_API_KEY;

const enableMonitoring = !!(process.env.REACT_APP_ENABLE_MONITORING === "true");

const enableCrashReporting = !!(
  process.env.REACT_APP_ENABLE_CRASH_REPORTING === "true"
);

const timelineVisiblePeriod = 24;
const timelineTotalPeriod = 7 * 24;

const defaultUserSettings: UserSettings = {
  [SettingKey.Theme]: "system",
  [SettingKey.Language]: "system",
  [SettingKey.TimeFormat]: "system",
  [SettingKey.MarketSelection]: ["XNYS", "XNAS", "XLON", "XJPX", "XAMS"],
  [SettingKey.MarketSort]: MarketSortingMethod.CHRONOLOGICALLY,
};

export const config = {
  appName,
  appVersion,
  nodeEnv,
  environmentId,
  graphqlAPIEndpoint,
  timelineVisiblePeriod,
  timelineTotalPeriod,
  settings,
  defaultUserSettings,
  raygunAPIKey,
  enableMonitoring,
  enableCrashReporting,
};
