import React, { useState, useEffect } from "react";
import {
  Switch,
  Route,
  Redirect,
  useRouteMatch,
  useHistory,
  useLocation,
} from "react-router-dom";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import { routes } from "lib/constants";
import { sendTelemetryPageView } from "lib/utils";
import { ErrorHandler } from "lib/handlers";
import { TopBar } from "components/organisms";
import {
  LoginView,
  MarketSelectionDialog,
  SettingsDialog,
  TimelinesView,
} from "components/views";

const TopBarOffset = styled("div")(({ theme }) => theme.mixins.toolbar);

export const App: React.FunctionComponent = () => {
  const history = useHistory();
  const location = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const settingsRouteMatch = useRouteMatch(routes.settings);
  const marketSelectionRouteMatch = useRouteMatch(routes.marketSelection);

  const closeDialog = () => {
    setDialogOpen(false);
    history.push(routes.home);
  };

  useEffect(() => {
    sendTelemetryPageView(location.pathname);
  }, [location]);

  useEffect(() => {
    setDialogOpen(
      !!settingsRouteMatch?.isExact || !!marketSelectionRouteMatch?.isExact
    );
  }, [settingsRouteMatch, marketSelectionRouteMatch]);

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TopBar />
      <TopBarOffset />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <ErrorHandler>
          <Switch>
            <Route
              path={[routes.home, routes.settings, routes.marketSelection]}
              exact
            >
              <TimelinesView />
            </Route>
            <Route path={routes.login} exact>
              <LoginView />
            </Route>
            <Route>
              <Redirect to={routes.home} />
            </Route>
          </Switch>
        </ErrorHandler>
      </Box>
      <MarketSelectionDialog
        open={dialogOpen && !!marketSelectionRouteMatch?.isExact}
        onClose={closeDialog}
      />
      <SettingsDialog
        open={dialogOpen && !!settingsRouteMatch?.isExact}
        onClose={closeDialog}
      />
    </Box>
  );
};
