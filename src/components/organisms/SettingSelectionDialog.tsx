import React from "react";
import {
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useIntl } from "react-intl";
import { SettingValue } from "lib/types";

interface Props {
  title: string;
  selectedValue: string;
  values: SettingValue[];
  open: boolean;
  onClose: (value: string) => void;
}

export const SettingSelectionDialog: React.FunctionComponent<Props> = (
  props
) => {
  const { open, selectedValue, onClose, title, values } = props;
  const i18n = useIntl();

  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleListItemClick = (value: string) => {
    onClose(value);
  };

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="">
      <DialogTitle id="dialog-title">{title}</DialogTitle>
      <List>
        {values.map((value) => (
          <ListItem
            button
            onClick={() => handleListItemClick(value.key)}
            key={value.key}
          >
            <ListItemText
              primary={
                typeof value.labelMessage === "string"
                  ? value.labelMessage
                  : i18n.formatMessage(value.labelMessage)
              }
            />
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
};
