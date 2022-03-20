import React, { useState, useEffect, useMemo, useRef } from "react";
import { config } from "config";
import { UserSettings, VeridaDatastoreListener } from "lib/types";
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
  const { datastore, isConnected } = useVerida();
  const [userSettings, setUserSettings] =
    useState<UserSettings>(initialUserSettings);
  const [datastoreListener, setDatastoreListener] =
    useState<VeridaDatastoreListener | null>(null);

  useEffect(() => {
    if (!datastore) {
      datastoreInitialised.current = false;
      return;
    }

    // Excute this useEffect only if the settings context has not been initialised with the datastore
    if (datastoreInitialised.current === true) {
      return;
    }

    const initialisationHandler = async () => {
      // First time using the datastore, if empty, initialise it with the
      // current settings, otherwise override the current settings with the
      // settings from the datastore

      datastoreInitialised.current = true;

      const settingsRecord = await Verida.getSettingsRecord(datastore);
      if (!settingsRecord) {
        //No Settings record found, initialising with current settings in browser

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
        //Settings record found, replace browser settings with datastore settings

        setUserSettings({
          language: settingsRecord.language,
          theme: settingsRecord.theme,
          marketSelection: settingsRecord.marketSelection,
          marketSort: settingsRecord.marketSort,
          timeFormat: settingsRecord.timeFormat,
        });
      }
    };

    void initialisationHandler();
  }, [userSettings, datastore]);

  useEffect(() => {
    // Put the datastore change listener in its own useEffect to isolate and try to fix the bug

    logger.debug("[ChangeListenerUseEffect] starting");
    if (!datastore) {
      logger.debug("[ChangeListenerUseEffect] no datastore, exit");
      return;
    }

    const handler = async () => {
      logger.debug("[ChangeListenerUseEffect] starting handler");
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any
      const listener = await datastore.changes(async (changes: any) => {
        logger.debug("received datastore changes", changes);
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

      // For some reasons, the listener callback is registered with 'await
      // datastore.changes(...);' but the execution stops there and never
      // reach the next line!!

      logger.debug("[ChangeListenerUseEffect] getting the listener", listener);

      setDatastoreListener(() => {
        logger.debug(
          "[ChangeListenerUseEffect] setting the listener in the state"
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return listener;
      });
    };

    void handler();
  }, [datastore]);

  useEffect(() => {
    // Cancel the datastore listener when disconnecting
    if (!isConnected && datastoreListener) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      datastoreListener.cancel();
    }
    return () => {
      // Cancel the datastore listener when unmounting
      if (datastoreListener) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        datastoreListener.cancel();
      }
    };
  }, [isConnected, datastoreListener]);

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
