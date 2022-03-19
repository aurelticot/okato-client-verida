import React, { useState, useEffect, useMemo, useRef } from "react";
import { config } from "config";
import { UserSettings } from "lib/types";
import { recordTelemetryBreadcrumb, getLogger, Verida } from "lib/utils";
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

      datastoreInitialised.current = true;

      const settingsRecord = await Verida.getSettingsRecord(datastore);
      if (!settingsRecord) {
        logger.debug(
          `No Settings record found, initialising with current settings in browser`
        );

        const success = await Verida.saveSettings(
          datastore,
          userSettings,
          null
        );
        if (success) {
          logger.debug(
            `Datastore initialised with current settings`,
            userSettings
          );
        } else {
          datastoreInitialised.current = false;
          logger.error(`Datastore initialisation failed`, {
            settings: userSettings,
            errors: datastore.errors,
          });
          return;
        }
      } else {
        logger.debug(
          `Settings record found, replace browser settings with datastore settings`
        );
        // TODO find a better way to convert Settings state and Settings record
        setUserSettings({
          language: settingsRecord.language,
          theme: settingsRecord.theme,
          marketSelection: settingsRecord.marketSelection,
          marketSort: settingsRecord.marketSort,
          timeFormat: settingsRecord.timeFormat,
        });
      }

      // TODO handle cancel at unmount and disconnection
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await datastore.changes(async (row: any) => {
        logger.debug("received datastore changes", row);
        const updatedRecord = await Verida.getSettingsRecord(datastore);
        if (updatedRecord) {
          setUserSettings({
            language: updatedRecord.language,
            theme: updatedRecord.theme,
            marketSelection: updatedRecord.marketSelection,
            marketSort: updatedRecord.marketSort,
            timeFormat: updatedRecord.timeFormat,
          });
        }
      });
    };

    if (datastoreInitialised.current === false) {
      void initialisationHandler();
    }
  }, [userSettings, datastore]);

  useEffect(() => {
    if (!localStorage) {
      return;
    }
    localStorage.setItem(
      userSettingsLocalStorageKey,
      JSON.stringify(userSettings)
    );
    logger.info(`User Settings saved in local storage`, userSettings);
  }, [userSettings]);

  const contextValue = useMemo(() => {
    const setter = async (key: string, value: string | string[]) => {
      const newSettings = { ...userSettings, [key]: value };

      logger.info("User Settings changed", {
        setting: key,
        newValue: value,
      });

      setUserSettings(newSettings);

      if (datastore) {
        // Updating the datastore with the update on current settings
        const settingsRecord = await Verida.getSettingsRecord(datastore);
        const success = await Verida.saveSettings(
          datastore,
          newSettings,
          settingsRecord
        );
        if (success) {
          logger.debug(`User Settings saved in datastore`, newSettings);
        } else {
          logger.error(`Settings save in datastore failed`, {
            settings: newSettings,
            errors: datastore.errors,
          });
        }
      }

      recordTelemetryBreadcrumb("info", "Changed User Setting", "", {
        setting: key,
        newValue: value,
      });
    };
    return {
      userSettings,
      setUserSetting: setter,
    };
  }, [userSettings, datastore]);

  return (
    <UserSettingsContext.Provider value={contextValue}>
      {props.children}
    </UserSettingsContext.Provider>
  );
};
