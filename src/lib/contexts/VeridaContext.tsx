import React, { useCallback } from "react";
import { Network, Context } from "@verida/client-ts";
import { VaultAccount } from "@verida/account-web-vault";
import { config } from "config";

type UserProfile = {
  name?: string;
  avatar?: string;
};

type VeridaContextType = {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isConnecting: boolean;
  isConnected: boolean;
  account: VaultAccount | null;
  context: Context | null;
  did: string | null;
  profile: UserProfile | null;
};

export const VeridaContext = React.createContext<VeridaContextType>({
  connect: async () => {},
  disconnect: async () => {},
  isConnecting: false,
  isConnected: false,
  account: null,
  context: null,
  did: null,
  profile: null,
});

export const VeridaProvider: React.FunctionComponent = (props) => {
  const [isConnecting, setIsConnecting] = React.useState<boolean>(false);
  const [account, setAccount] = React.useState<VaultAccount | null>(null);
  const [context, setContext] = React.useState<Context | null>(null);
  const [did, setDID] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);

  const isConnected = !!account && !!context;

  const connect = useCallback(async () => {
    if (!config.veridaContextName) {
      // TODO handle env variable not defined
      return;
    }

    setIsConnecting(true);
    const tempAccount = new VaultAccount({
      logoUrl: config.veridaLogoUrl,
    });

    // TODO handle error
    const tempContext = await Network.connect({
      client: {
        environment: config.veridaEnv,
      },
      account: tempAccount,
      context: {
        name: config.veridaContextName,
      },
    });

    setIsConnecting(false);
    if (!tempContext) {
      // TODO Handle connection failed/cancelled
      return;
    }

    setContext(tempContext);
    setAccount(tempAccount);
    // TODO handle error
    const tempDID = await tempAccount.did();
    setDID(tempDID);

    const client = tempContext.getClient();
    // TODO handle error
    const profileInstance = await client.openPublicProfile(
      tempDID,
      "Verida: Vault"
    );
    if (profileInstance) {
      // TODO handle error
      const profileData = (await profileInstance.getMany({}, {})) as {
        name?: string;
        avatar?: { uri: string };
      };
      setProfile({
        name: profileData?.name,
        avatar: profileData?.avatar?.uri,
      });
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (account) {
      // TODO handle error
      await account.disconnect(config.veridaContextName);
    }
    setAccount(null);
    setContext(null);
    setDID(null);
  }, [account]);

  const contextValue: VeridaContextType = {
    connect,
    disconnect,
    isConnecting,
    isConnected,
    account,
    context,
    did,
    profile,
  };

  return (
    <VeridaContext.Provider value={contextValue}>
      {props.children}
    </VeridaContext.Provider>
  );
};
