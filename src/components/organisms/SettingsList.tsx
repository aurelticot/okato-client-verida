import React, { useState } from "react";
import { Box, List, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { SettingDialogConfiguration } from "lib/types";
import {
  SettingSelectionDialog,
  LanguageSettingItem,
  MarketSortSettingItem,
  ThemeSettingItem,
  TimeFormatSettingItem,
} from "components/organisms";
import { useVerida } from "lib/hooks";

const emptyDialogProps: SettingDialogConfiguration = {
  title: "",
  selectedValue: "",
  values: [],
  applyValue: () => {},
};

export const SettingsList: React.FunctionComponent = () => {
  const i18n = useIntl();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfiguration, setDialogConfiguration] =
    useState<SettingDialogConfiguration>(emptyDialogProps);
  const { isConnected } = useVerida();

  const openDialog = (
    settingsDialogConfiguration: SettingDialogConfiguration
  ) => {
    setDialogConfiguration(settingsDialogConfiguration);
    setDialogOpen(true);
  };

  const closeDialog = (value: string) => {
    dialogConfiguration.applyValue(value);
    setDialogOpen(false);
  };

  const synchronisedInVerida = i18n.formatMessage({
    id: "SettingsList.synchronisedInVerida",
    defaultMessage: "Your settings are synchronised in your Verida account.",
    description:
      "Message stating the settings are synchronised in the users' Verida account",
  });

  return (
    <>
      {isConnected && (
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="body2">{synchronisedInVerida}</Typography>
        </Box>
      )}
      <List sx={{ p: 0 }}>
        <ThemeSettingItem onClick={openDialog} />
        <LanguageSettingItem onClick={openDialog} />
        <TimeFormatSettingItem onClick={openDialog} />
        <MarketSortSettingItem onClick={openDialog} />
      </List>
      <SettingSelectionDialog
        open={dialogOpen}
        {...dialogConfiguration}
        onClose={closeDialog}
      />
    </>
  );
};
