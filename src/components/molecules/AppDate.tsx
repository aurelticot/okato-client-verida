import React from "react";
import { useIntl } from "react-intl";
import { useRealTime } from "lib/hooks";
import { DateTime } from "luxon";
import { FluidText } from "components/atoms";
import { getFluidTextValues } from "lib/utils";

const mainFluidText = getFluidTextValues(1);

interface Props {
  time: Date | null;
}

export const AppDate: React.FunctionComponent<Props> = ({ time }) => {
  const realtime = useRealTime();
  const i18n = useIntl();

  const labelToday = i18n.formatMessage({
    id: "AppDate.today",
    defaultMessage: "Today",
  });

  if (!time) {
    return <FluidText {...mainFluidText}>{labelToday}</FluidText>;
  }

  const realDateTime = DateTime.fromJSDate(realtime);
  const dateTime = DateTime.fromJSDate(time);

  if (dateTime.hasSame(realDateTime, "day")) {
    return <FluidText {...mainFluidText}>{labelToday}</FluidText>;
  }

  const labelTomorrow = i18n.formatMessage({
    id: "AppDate.tomorrow",
    defaultMessage: "Tomorrow",
  });
  const labelYesterday = i18n.formatMessage({
    id: "AppDate.yesterday",
    defaultMessage: "Yesterday",
  });

  if (dateTime.hasSame(realDateTime.plus({ days: 1 }), "day")) {
    return <FluidText {...mainFluidText}>{labelTomorrow}</FluidText>;
  }

  if (dateTime.hasSame(realDateTime.minus({ days: 1 }), "day")) {
    return <FluidText {...mainFluidText}>{labelYesterday}</FluidText>;
  }

  return <FluidText {...mainFluidText}>{i18n.formatDate(time)}</FluidText>;
};
