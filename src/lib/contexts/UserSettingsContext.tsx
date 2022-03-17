import React, { useState, useEffect, useMemo, useRef } from "react";
import { config } from "config";
import { UserSettings, SettingsRecord } from "lib/types";
import { recordTelemetryBreadcrumb, getLogger } from "lib/utils";
import { useVerida } from "lib/hooks";
const logger = getLogger("UserSettings");

const { defaultUserSettings, settings } = config;

const userSettingsLocalStorageKey = "userSettings";

const storedUserSettings: UserSettings | null = localStorage
  ? (JSON.parse(
      localStorage.getItem(userSettingsLocalStorageKey) as string
    ) as UserSettings)
  : null;

const initialUserSettings: UserSettings = storedUserSettings
  ? (Object.assign(
      {},
      ...Object.entries(storedUserSettings).map(
        ([settingKey, userSettingValue]) => {
          const settingDefinition = settings[settingKey];
          if (!settingDefinition) {
            return { [settingKey]: userSettingValue };
          }
          const correctValue =
            settingDefinition.values.filter(
              (value) => value.key === userSettingValue
            ).length > 0;
          return {
            [settingKey]: correctValue
              ? userSettingValue
              : defaultUserSettings[settingKey],
          };
        }
      )
    ) as UserSettings)
  : defaultUserSettings;

export const UserSettingsContext = React.createContext({
  userSettings: initialUserSettings,
  setUserSetting: (_key: string, _value: string | string[]): void => {},
});

export const UserSettingsProvider: React.FunctionComponent = (props) => {
  const datastoreInitialised = useRef(false);
  const { datastore } = useVerida();
  const [userSettings, setUserSettings] =
    useState<UserSettings>(initialUserSettings);

  useEffect(() => {
    if (!datastore) {
      datastoreInitialised.current = false;
      return;
    }
    const initialisationHandler = async () => {
      logger.debug(`User Settings datastore initialisation handler`);
      // First time using the datastore, if empty, initialise it with the
      // current settings, otherwise override the current settings with the
      // settings from the datastore

      const settingsRecords = await datastore.getMany();
      if (!settingsRecords || settingsRecords.length === 0) {
        logger.debug(
          `No Settings record found, initialising with current settings in browser`
        );
        // TODO handle errors
        // TODO find a better way to cast the property types
        const recordToSave: Omit<SettingsRecord, "_id" | "_rev"> = {
          language: userSettings.language as string,
          theme: userSettings.theme as
            | "system"
            | "black"
            | "dark"
            | "light"
            | "white",
          marketSelection: userSettings.marketSelection as string[],
          marketSort: userSettings.marketSort as
            | "ALPHABETICALLY"
            | "ALPHABETICALLY_REVERSE"
            | "CAPITALISATION"
            | "CAPITALISATION_REVERSE"
            | "CHRONOLOGICALLY"
            | "CHRONOLOGICALLY_REVERSE",
          timeFormat: userSettings.timeFormat as
            | "system"
            | "12-hour"
            | "24-hour",
        };
        const success = await datastore.save({ recordToSave });
        if (success) {
          logger.debug(
            `Datastore initialised with current settings`,
            userSettings
          );
        } else {
          logger.error(`Datastore initialisation failed`, {
            settings: userSettings,
            errors: datastore.errors,
          });
          return;
        }
      } else {
        const record = settingsRecords[0] as SettingsRecord;
        // TODO find a better way to convert Settings state and Settings record
        setUserSettings({
          language: record.language,
          theme: record.theme,
          marketSelection: record.marketSelection,
          marketSort: record.marketSort,
          timeFormat: record.timeFormat,
        });
      }

      datastoreInitialised.current = true;
    };

    const updateHandler = async () => {
      logger.debug(`User Settings datastore update handler`);
      // Updating the datastore with the update on current settings

      const settingsRecords = await datastore.getMany();
      const record = settingsRecords[0] as SettingsRecord;

      // Get the _id and _rev from the record and the settings properties from the state
      // TODO find a better way to cast the property types
      const recordToSave: SettingsRecord = {
        ...record,
        language: userSettings.language as string,
        theme: userSettings.theme as
          | "system"
          | "black"
          | "dark"
          | "light"
          | "white",
        marketSelection: userSettings.marketSelection as string[],
        marketSort: userSettings.marketSort as
          | "ALPHABETICALLY"
          | "ALPHABETICALLY_REVERSE"
          | "CAPITALISATION"
          | "CAPITALISATION_REVERSE"
          | "CHRONOLOGICALLY"
          | "CHRONOLOGICALLY_REVERSE",
        timeFormat: userSettings.timeFormat as "system" | "12-hour" | "24-hour",
      };
      const success = await datastore.save(recordToSave);
      if (success) {
        logger.debug(`User Settings saved in datastore`, userSettings);
      } else {
        logger.error(`Settings save in datastore failed`, {
          settings: userSettings,
          errors: datastore.errors,
        });
      }
    };

    if (datastoreInitialised.current === false) {
      void initialisationHandler();
    } else {
      void updateHandler();
    }
  }, [userSettings, datastore]);

  useEffect(() => {
    if (localStorage && !datastore && datastoreInitialised.current === false) {
      localStorage.setItem(
        userSettingsLocalStorageKey,
        JSON.stringify(userSettings)
      );
      logger.info(`User Settings saved in local storage`, userSettings);
    }
  }, [userSettings, datastore]);

  const contextValue = useMemo(() => {
    const setter = (key: string, value: string | string[]) => {
      setUserSettings({ ...userSettings, [key]: value });
      recordTelemetryBreadcrumb("info", "Changed User Setting", "", {
        setting: key,
        newValue: value,
      });
      logger.info("User Settings changed", {
        setting: key,
        newValue: value,
      });
    };
    return {
      userSettings,
      setUserSetting: setter,
    };
  }, [userSettings]);

  return (
    <UserSettingsContext.Provider value={contextValue}>
      {props.children}
    </UserSettingsContext.Provider>
  );
};
