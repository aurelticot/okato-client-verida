import { UserSettings } from "./settings";

export type UserProfile = {
  id: string;
  name?: string;
  avatar?: string;
};

export interface RecordMeta {
  _id: string;
  _rev: string;
}

export type SettingsRecord = RecordMeta & UserSettings;
