import React, { useCallback } from "react";
import { Context } from "@verida/client-ts";
import { VaultAccount } from "@verida/account-web-vault";
import { config } from "config";
import { UserProfile } from "lib/types";
import { Verida } from "lib/utils";

type VeridaContextType = {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isConnecting: boolean;
  isConnected: boolean;
  account: VaultAccount | null;
  context: Context | null;
  profile: UserProfile | null;
};

export const VeridaContext = React.createContext<VeridaContextType>({
  connect: async () => {},
  disconnect: async () => {},
  isConnecting: false,
  isConnected: false,
  account: null,
  context: null,
  profile: null,
});

export const VeridaProvider: React.FunctionComponent = (props) => {
  const [isConnecting, setIsConnecting] = React.useState<boolean>(false);
  const [isConnected, setIsConnected] = React.useState<boolean>(false);
  const [account, setAccount] = React.useState<VaultAccount | null>(null);
  const [context, setContext] = React.useState<Context | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);

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
      setIsConnected(true);
    } catch {
      setIsConnected(false);
      setAccount(null);
      setContext(null);
      setProfile(null);
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
  }, [account]);

  const contextValue: VeridaContextType = {
    connect,
    disconnect,
    isConnecting,
    isConnected,
    account,
    context,
    profile,
  };

  return (
    <VeridaContext.Provider value={contextValue}>
      {props.children}
    </VeridaContext.Provider>
  );
};
