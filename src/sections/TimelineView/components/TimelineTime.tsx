import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Tooltip } from "@material-ui/core";
import { Refresh as RefreshIcon } from "@material-ui/icons";
import { AppDate } from "../../../lib/components/AppDate";
import { RealTimeClock } from "../../../lib/components/RealTimeClock";
import { Clock } from "../../../lib/components/Clock";
import { useIntl } from "react-intl";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "stretch",
  },
  timeContainer: {
    backgroundColor: theme.palette.background.default,
    paddingTop: `${theme.spacing(2)}px`,
    paddingRight: `${theme.spacing(1.5)}px`,
    paddingBottom: `${theme.spacing(0.5)}px`,
    paddingLeft: `${theme.spacing(1.5)}px`,
    position: "relative",
  },
  timeContainerButton: {
    cursor: "pointer",
  },
  timeWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  refreshIndicator: {
    position: "absolute",
    top: "-2px",
    left: "50%",
    marginLeft: "-6px",
  },
  shadowBorder: {
    width: theme.spacing(3),
    paddingBottom: theme.spacing(0.5),
  },
  shadowBorderLeft: {
    background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, ${theme.palette.background.default} 100%)`,
  },
  shadowBorderRight: {
    background: `linear-gradient(270deg, rgba(255,255,255,0) 0%, ${theme.palette.background.default} 100%)`,
  },
}));

interface Props {
  time: Date | null;
  onClickBackToRealTime: () => void;
}

export const TimelineTime = (props: Props) => {
  const { time, onClickBackToRealTime } = props;
  const i18n = useIntl();

  const backToRealtimeTooltipMessage = i18n.formatMessage({
    id: "TimelineTime.backToRealtimeTooltip",
    defaultMessage: "Click to come back to real-time",
    description: "Tooltip message on the button to come back to real time",
  });
  const displayingRealtimeTooltipMessage = i18n.formatMessage({
    id: "TimelineTime.displayingRealtimeTooltip",
    defaultMessage: "Displaying real-time",
    description: "Tooltip message on the time displaying in realtime",
  });

  const realtimeTooltip = time
    ? backToRealtimeTooltipMessage
    : displayingRealtimeTooltipMessage;

  const classes = useStyles();
  return (
    <Box className={classes.root}>
      <Box className={`${classes.shadowBorder} ${classes.shadowBorderLeft}`} />
      <Tooltip
        title={realtimeTooltip}
        aria-label={realtimeTooltip}
        arrow
        interactive
        placement="top"
        disableFocusListener
      >
        <Box
          className={`${classes.timeContainer} ${
            time ? classes.timeContainerButton : ""
          }`}
          onClick={onClickBackToRealTime}
        >
          {time && (
            <Box className={classes.refreshIndicator}>
              <RefreshIcon style={{ fontSize: "0.8rem" }} />
            </Box>
          )}
          <Box className={classes.timeWrapper}>
            <AppDate time={time} />
            {time ? <Clock time={time} /> : <RealTimeClock />}
          </Box>
        </Box>
      </Tooltip>
      <Box className={`${classes.shadowBorder} ${classes.shadowBorderRight}`} />
    </Box>
  );
};
