import React from "react";
import { Button, ButtonProps, styled } from "@mui/material";
import { useIntl } from "react-intl";
import { ReactComponent as VeridaLogo } from "./verida_logo.svg";

const WhiteButton = styled(Button)<ButtonProps>(({ theme }) => ({
  "color": theme.palette.getContrastText(theme.palette.common.white),
  "backgroundColor": theme.palette.common.white,
  "&:hover": {
    backgroundColor: theme.palette.grey[200],
  },
}));

export const ConnectVeridaButton: React.FunctionComponent<ButtonProps> = (
  props
) => {
  const i18n = useIntl();

  const ConnectWithVeridaButtonLabel = i18n.formatMessage({
    id: "ConnectVeridaButton.ConnectWithVeridaButtonLabel",
    description: "Label of the the 'Connect with Verida' button",
    defaultMessage: "Connect with",
  });

  return (
    <WhiteButton
      {...props}
      variant="contained"
      endIcon={<VeridaLogo height={34} width={100} />}
    >
      {ConnectWithVeridaButtonLabel}
    </WhiteButton>
  );
};
