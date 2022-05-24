import React, { useCallback, useEffect } from "react";
import { Context } from "@verida/client-ts";
import Datastore from "@verida/client-ts/dist/context/datastore";
import { VaultAccount, hasSession } from "@verida/account-web-vault";
import { config } from "config";
import { UserProfile } from "lib/types";
import { Verida, getLogger } from "lib/utils";
import { schemaURLs } from "lib/constants";
const logger = getLogger("Verida");

type VeridaContextType = {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isConnecting: boolean;
  isConnected: boolean;
  account: VaultAccount | null;
  context: Context | null;
  profile: UserProfile | null;
  datastore: Datastore | null;
};

export const VeridaContext = React.createContext<VeridaContextType>({
  connect: async () => {},
  disconnect: async () => {},
  isConnecting: false,
  isConnected: false,
  account: null,
  context: null,
  profile: null,
  datastore: null,
});

export const VeridaProvider: React.FunctionComponent = (props) => {
  const [isConnecting, setIsConnecting] = React.useState<boolean>(false);
  const [isConnected, setIsConnected] = React.useState<boolean>(false);
  const [account, setAccount] = React.useState<VaultAccount | null>(null);
  const [context, setContext] = React.useState<Context | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [datastore, setDatastore] = React.useState<Datastore | null>(null);

  const connect = useCallback(async () => {
    if (!config.veridaContextName) {
      // TODO handle env variable not defined
      return;
    }

    setIsConnecting(true);
    try {
      const [vContext, vAccount, vProfile] = await Verida.connect(
        config.veridaContextName,
        config.veridaEnv,
        config.veridaLogoUrl
      );
      setContext(vContext);
      setAccount(vAccount);
      setProfile(vProfile);
      const settingsDatastore = await Verida.openDatastore(
        vContext,
        schemaURLs.settings
      );
      setDatastore(settingsDatastore);
      setIsConnected(true);
    } catch (error) {
      logger.error(error);
      setIsConnected(false);
      setAccount(null);
      setContext(null);
      setProfile(null);
      setDatastore(null);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (account) {
      // TODO handle error
      await Verida.disconnect(account, config.veridaContextName);
    }
    setIsConnected(false);
    setIsConnecting(false);
    setAccount(null);
    setContext(null);
    setProfile(null);
    setDatastore(null);
  }, [account]);

  useEffect(() => {
    if (config.veridaContextName && hasSession(config.veridaContextName)) {
      void connect();
    }
  }, [connect]);

  const contextValue: VeridaContextType = {
    connect,
    disconnect,
    isConnecting,
    isConnected,
    account,
    context,
    profile,
    datastore,
  };

  return (
    <VeridaContext.Provider value={contextValue}>
      {props.children}
    </VeridaContext.Provider>
  );
};
