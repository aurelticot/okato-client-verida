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

interface Props {
  onClick: () => void;
  isConnecting: boolean;
}

export const ConnectVeridaButton: React.FunctionComponent<Props> = ({
  onClick,
  isConnecting,
}) => {
  const i18n = useIntl();

  const buttonLabel = i18n.formatMessage({
    id: "ConnectVeridaButton.buttonLabel",
    description: "Label of the the 'Connect with Verida' button",
    defaultMessage: "Connect with",
  });

  const progressIndicatorMessage = i18n.formatMessage({
    id: "ConnectVeridaButton.progressIndicatorMessage",
    description: "Message displayed in the button when connecting",
    defaultMessage: "Connecting...",
  });

  return (
    <WhiteButton
      onClick={onClick}
      disabled={isConnecting}
      variant="contained"
      endIcon={<VeridaLogo height={34} width={100} />}
    >
      {isConnecting ? progressIndicatorMessage : buttonLabel}
    </WhiteButton>
  );
};
