import React from "react";
import {
  AppBar,
  Avatar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import { MoreVert as MoreIcon } from "@mui/icons-material";
import { useHistory } from "react-router-dom";
import { useIntl } from "react-intl";
import { routes } from "lib/constants";
import { useVerida } from "lib/hooks";

export const TopBar: React.FunctionComponent = () => {
  const history = useHistory();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const { isConnected, profile, disconnect } = useVerida();
  const i18n = useIntl();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (to: string) => {
    history.push(to);
    closeMenu();
  };

  const handleLoginClick = () => {
    history.push(routes.login);
  };

  const handleLogoutClick = async () => {
    await disconnect(); // TODO handle error
    closeMenu();
  };

  const appTitle = i18n.formatMessage({
    id: "ApplicationBar.appTitle",
    description: "Name/Title of the application",
    defaultMessage: "Market Timeline",
  });

  const marketSelectionMenuItemLabel = i18n.formatMessage({
    id: "ApplicationBar.marketSelectionMenuItemLabel",
    description: "Label of the menu item for the Market Selection view",
    defaultMessage: "Market selection",
  });

  const settingsMenuItemLabel = i18n.formatMessage({
    id: "ApplicationBar.settingsMenuItemLabel",
    description: "Label of the menu item for the Settings view",
    defaultMessage: "Settings",
  });

  const loginButtonLabel = i18n.formatMessage({
    id: "ApplicationBar.loginButtonLabel",
    description: "Label of the Login button in the top bar",
    defaultMessage: "Login",
  });

  const logoutMenuItemLabel = i18n.formatMessage({
    id: "ApplicationBar.logoutMenuItemLabel",
    description: "Label of the menu item for the Logout function",
    defaultMessage: "Logout",
  });

  const menu = (
    <Menu
      id="appbar.menu-more"
      open={menuOpen}
      anchorEl={anchorEl}
      onClose={closeMenu}
      keepMounted
    >
      <MenuItem onClick={() => handleMenuItemClick(routes.marketSelection)}>
        {marketSelectionMenuItemLabel}
      </MenuItem>
      <MenuItem onClick={() => handleMenuItemClick(routes.settings)}>
        {settingsMenuItemLabel}
      </MenuItem>
      {isConnected && (
        <MenuItem onClick={handleLogoutClick}>{logoutMenuItemLabel}</MenuItem>
      )}
    </Menu>
  );

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: `background.default`,
        color: `text.primary`,
      }}
      elevation={0}
    >
      <Toolbar>
        <Typography
          component="h1"
          variant="h6"
          sx={{
            flexGrow: 1,
          }}
        >
          {appTitle}
        </Typography>
        <Box>
          {!isConnected && (
            <>
              <Button color="inherit" onClick={handleLoginClick}>
                {loginButtonLabel}
              </Button>
              <IconButton
                aria-label="more"
                aria-controls="appbar.menu-more"
                aria-haspopup="true"
                onClick={handleMenu}
                size="large"
              >
                <MoreIcon />
              </IconButton>
            </>
          )}
          {isConnected && (
            <IconButton
              aria-label="more"
              aria-controls="appbar.menu-more"
              aria-haspopup="true"
              onClick={handleMenu}
              sx={{ p: 0 }}
            >
              <Avatar
                sx={{ width: { xs: 32, md: 40 }, height: { xs: 32, md: 40 } }}
                alt={profile?.name}
                src={profile?.avatar}
              />
            </IconButton>
          )}
          {menu}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
