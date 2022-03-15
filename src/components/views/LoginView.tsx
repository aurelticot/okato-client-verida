import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { Redirect, useHistory } from "react-router-dom";
import { routes } from "lib/constants";
import { useVerida } from "lib/hooks";

export const LoginView: React.FunctionComponent = () => {
  const history = useHistory();
  const { connect, isConnected } = useVerida();

  if (isConnected) {
    return <Redirect to={routes.home} />;
  }

  // TODO rework layout

  return (
    <Box>
      <Typography>Login page</Typography>
      <Button onClick={connect}>Connect with Verida</Button>
      <Button onClick={() => history.push(routes.home)}>Cancel</Button>
    </Box>
  );
};
