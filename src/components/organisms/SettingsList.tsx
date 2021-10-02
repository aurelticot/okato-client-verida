import React, { useState } from "react";
import { List } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { SettingDialogConfiguration } from "lib/types";
import {
  SettingSelectionDialog,
  LanguageSettingItem,
  MarketSortSettingItem,
  ThemeSettingItem,
} from "components/organisms";

const useStyles = makeStyles((_theme) => ({
  list: {
    padding: "0",
  },
}));

const emptyDialogProps: SettingDialogConfiguration = {
  title: "",
  selectedValue: "",
  values: [],
  applyValue: () => {},
};

export const SettingsList: React.FunctionComponent = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfiguration, setDialogConfiguration] =
    useState<SettingDialogConfiguration>(emptyDialogProps);

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

  const classes = useStyles();
  return (
    <>
      <List className={classes.list}>
        <ThemeSettingItem onClick={openDialog} />
        <LanguageSettingItem onClick={openDialog} />
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
