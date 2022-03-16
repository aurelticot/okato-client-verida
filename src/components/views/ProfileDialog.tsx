import React from "react";
import { useIntl } from "react-intl";
import { Avatar, Box, Button, Typography, useTheme, Link } from "@mui/material";
import { useVerida } from "lib/hooks";
import { ConnectVeridaButton } from "components/atoms";
import { AppDialog } from "components/molecules";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const ProfileDialog: React.FunctionComponent<Props> = ({
  open = false,
  onClose,
}) => {
  const { connect, disconnect, profile, isConnected } = useVerida();
  const i18n = useIntl();
  const theme = useTheme();

  const handleClose = () => {
    onClose();
  };

  const handleConnect = async () => {
    await connect();
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  const modalTitle = i18n.formatMessage({
    id: "ProfileDialog.modalTitle",
    description: "Title of the Profile dialog",
    defaultMessage: "Profile",
  });
  const closeButtonLabel = i18n.formatMessage({
    id: "ProfileDialog.closeButtonLabel",
    description: "Label of the the 'Close' button in the dialog",
    defaultMessage: "Close",
  });
  const salutation = i18n.formatMessage(
    {
      id: "ProfileDialog.salutation",
      description: "User salutation with his name",
      defaultMessage: "Hi {name}",
    },
    { name: <strong>{profile?.name}</strong> }
  );
  const connectedMessage = i18n.formatMessage(
    {
      id: "ProfileDialog.connectedMessage",
      description: "Message saying the user is connected",
      defaultMessage: "You are connected with your <bold>Verida</bold> account",
    },
    { bold: (str) => <strong>{str}</strong> }
  );
  const disconnectButtonLabel = i18n.formatMessage({
    id: "ProfileDialog.disconnectButtonLabel",
    description: "Label of the the 'Disconnect' button",
    defaultMessage: "Disconnect",
  });
  const privacyMessage = i18n.formatMessage(
    {
      id: "ProfileDialog.privacyMessage",
      description: "Privacy message in the profile and login dialog",
      defaultMessage:
        "We respect your privacy and your personal information. We have partnered with <bold>Verida</bold> to provide you with the best experience. <bold>Verida</bold> is a protocol allowing users to control their identity and their data. Check {websiteLink}.",
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

  return (
    <AppDialog
      title={modalTitle}
      open={open}
      onClose={onClose}
      actions={<Button onClick={handleClose}>{closeButtonLabel}</Button>}
    >
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
            <Typography sx={{ alignSelf: "stretch" }}>
              {connectedMessage}
              <Typography variant="body2">{profile?.id}</Typography>
            </Typography>
            <Button variant="contained" onClick={handleDisconnect}>
              {disconnectButtonLabel}
            </Button>
          </>
        ) : (
          <ConnectVeridaButton onClick={handleConnect} />
        )}
        <Typography sx={{ alignSelf: "stretch" }}>{privacyMessage}</Typography>
      </Box>
    </AppDialog>
  );
};
