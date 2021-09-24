import React from "react";
import { Box } from "@material-ui/core";
import { Market } from "lib/types";
import { Timeline, TimelineItemHeader } from "components/organisms";

interface Props {
  market: Market;
  baseTime: Date | null;
}

export const TimelineItem: React.FunctionComponent<Props> = ({
  market,
  baseTime,
}) => {
  return (
    <Box>
      <TimelineItemHeader baseTime={baseTime} market={market} />
      <Timeline segments={market.timeline} />
    </Box>
  );
};
