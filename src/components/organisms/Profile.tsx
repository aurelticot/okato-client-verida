import React from "react";
import { useIntl } from "react-intl";
import {
  Avatar,
  Box,
  Button,
  Typography,
  useTheme,
  Link,
  Alert,
} from "@mui/material";
import { EnvironmentType } from "@verida/client-ts";
import { useVerida } from "lib/hooks";
import { ConnectVeridaButton } from "components/atoms";
import { config } from "config";

export const Profile: React.FunctionComponent = () => {
  const { connect, disconnect, profile, isConnected, isConnecting } =
    useVerida();
  const i18n = useIntl();
  const theme = useTheme();

  const handleConnect = async () => {
    await connect();
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  const salutation = i18n.formatMessage(
    {
      id: "Profile.salutation",
      description: "User salutation with his name",
      defaultMessage: "Hi {name}",
    },
    { name: <strong>{profile?.name}</strong> }
  );
  const connectedMessage = i18n.formatMessage(
    {
      id: "Profile.connectedMessage",
      description: "Message saying the user is connected",
      defaultMessage: "You are connected with your <bold>Verida</bold> account",
    },
    { bold: (str) => <strong>{str}</strong> }
  );
  const disconnectButtonLabel = i18n.formatMessage({
    id: "Profile.disconnectButtonLabel",
    description: "Label of the the 'Disconnect' button",
    defaultMessage: "Disconnect",
  });
  const privacyMessage = i18n.formatMessage(
    {
      id: "Profile.privacyMessage",
      description: "Privacy message in the profile and login dialog",
      defaultMessage:
        "We respect your privacy and your personal information. To provide you with the best experience, we partnered with <bold>Verida</bold>, a protocol allowing users to control their identity and their data. Check {websiteLink}.",
    },
    {
      bold: (str) => <strong>{str}</strong>,
      websiteLink: (
        <Link
          href="https://www.verida.io"
          underline="hover"
          target="_blank"
          rel="noopener"
        >
          verida.io
        </Link>
      ),
    }
  );
  const notConnectedEnvMessage = i18n.formatMessage(
    {
      id: "Profile.notConnectedEnvMessage",
      description:
        "Message stating the environment the user will be connected to",
      defaultMessage: "You will be using the {env} environment",
    },
    { env: <strong>{config.veridaEnv}</strong> }
  );
  const connectedEnvMessage = i18n.formatMessage(
    {
      id: "Profile.connectedEnvMessage",
      description: "Message stating the environment the user is connected to",
      defaultMessage: "You are using the {env} environment",
    },
    { env: <strong>{config.veridaEnv}</strong> }
  );

  const veridaEnvironmentAlert =
    config.veridaEnv === EnvironmentType.MAINNET ? null : (
      <Alert
        variant="outlined"
        severity="warning"
        sx={{ alignSelf: "stretch" }}
      >
        {isConnected ? connectedEnvMessage : notConnectedEnvMessage}
      </Alert>
    );

  return (
    <Box
      sx={{
        px: 3,
        pb: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: theme.spacing(5),
      }}
    >
      <Avatar
        alt={profile?.name}
        src={profile?.avatar}
        sx={{ width: 128, height: 128 }}
      ></Avatar>
      <Typography component="h3" variant="h5">
        {salutation}
      </Typography>
      {isConnected ? (
        <>
          <Box sx={{ alignSelf: "stretch" }}>
            <Typography>{connectedMessage}</Typography>
            <Typography variant="body2">{profile?.id}</Typography>
          </Box>
          {veridaEnvironmentAlert}
          <Button variant="contained" onClick={handleDisconnect}>
            {disconnectButtonLabel}
          </Button>
        </>
      ) : (
        <>
          {veridaEnvironmentAlert}
          <ConnectVeridaButton
            onClick={handleConnect}
            isConnecting={isConnecting}
          />
        </>
      )}
      <Typography sx={{ alignSelf: "stretch" }}>{privacyMessage}</Typography>
    </Box>
  );
};
