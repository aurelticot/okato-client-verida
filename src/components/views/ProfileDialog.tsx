import React from "react";
import { useIntl } from "react-intl";
import { Button } from "@mui/material";
import { AppDialog } from "components/molecules";
import { Profile } from "components/organisms";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const ProfileDialog: React.FunctionComponent<Props> = ({
  open = false,
  onClose,
}) => {
  const i18n = useIntl();

  const handleClose = () => {
    onClose();
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

  return (
    <AppDialog
      title={modalTitle}
      open={open}
      onClose={onClose}
      actions={<Button onClick={handleClose}>{closeButtonLabel}</Button>}
    >
      <Profile />
    </AppDialog>
  );
};
