import {
  Network,
  EnvironmentType,
  Context,
  Datastore,
} from "@verida/client-ts";
import { VaultAccount } from "@verida/account-web-vault";
import {
  UserProfile,
  UserSettings,
  SettingsRecord,
  RecordMeta,
} from "lib/types";

const connect = async (
  contextName: string,
  environment: EnvironmentType,
  logoUrl?: string,
  openUrl?: string
): Promise<[context: Context, account: VaultAccount, profile: UserProfile]> => {
  const account = new VaultAccount({
    request: {
      logoUrl,
      openUrl,
    },
  });

  const context = await Network.connect({
    client: {
      environment,
    },
    account: account,
    context: {
      name: contextName,
    },
  });

  if (!context) {
    throw new Error("Verida Authentication Cancelled");
  }

  const did = await account.did();
  const profile = await getPublicProfileInfo(context, did);

  return [context, account, profile];
};

const disconnect = async (
  account: VaultAccount,
  contextName?: string
): Promise<void> => {
  await account.disconnect(contextName);
};

const getPublicProfileInfo = async (
  context: Context,
  did: string
): Promise<UserProfile> => {
  const profile: UserProfile = {
    id: did,
  };

  const client = context.getClient();
  const profileInstance = await client.openPublicProfile(did, "Verida: Vault");
  if (profileInstance) {
    const profileData = (await profileInstance.getMany({}, {})) as {
      name?: string;
      avatar?: { uri: string };
    };
    profile.name = profileData?.name;
    profile.avatar = profileData?.avatar?.uri;
  }

  return profile;
};

const openDatastore = async (
  context: Context,
  schemaURL: string
): Promise<Datastore> => {
  return await context.openDatastore(schemaURL);
};

const getSettingsRecord = async (
  datastore: Datastore
): Promise<SettingsRecord | null> => {
  try {
    const settingsRecords = await datastore.getMany();
    if (settingsRecords && settingsRecords.length !== 0) {
      return settingsRecords[0] as SettingsRecord;
    }
    return null;
  } catch {
    return null;
  }
};

const saveSettings = async (
  datastore: Datastore,
  userSettings: UserSettings,
  settingsRecord: SettingsRecord | null
): Promise<boolean> => {
  // TODO factorise logs here?
  try {
    const record = settingsRecord || {};
    // Get the metadata from the record and the settings properties from the argument
    const recordToSave: Partial<RecordMeta> & UserSettings = {
      ...record,
      language: userSettings.language,
      theme: userSettings.theme,
      marketSelection: userSettings.marketSelection,
      marketSort: userSettings.marketSort,
      timeFormat: userSettings.timeFormat,
    };
    return !!(await datastore.save(recordToSave));
  } catch {
    return false;
  }
};

export const Verida = {
  connect,
  disconnect,
  getPublicProfileInfo,
  openDatastore,
  getSettingsRecord,
  saveSettings,
};
