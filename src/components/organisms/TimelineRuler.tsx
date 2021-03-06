import React, { useCallback, useEffect, useState } from "react";
import { DateTime } from "luxon";
import { Box, Paper, useMediaQuery, useTheme } from "@mui/material";
import { useIntl } from "react-intl";
import { SettingKey, TimeFormat } from "lib/types";
import { useScheduleJob, useUserSetting } from "lib/hooks";
import { everyMinuteSchedule } from "lib/constants";
import {
  getTimelineSizeInMinutes,
  getTimelineDates,
  getFluidTextValues,
} from "lib/utils";
import { defaultLocale } from "lib/lang";
import { FluidTypography } from "components/atoms";
import { TimelineRulerTime } from "components/organisms";

const timelineSizeInMinutes = getTimelineSizeInMinutes();
const dayFluidText = getFluidTextValues(0.8);
const hourFluidText = getFluidTextValues(0.8);

interface Segment {
  start: number;
  duration: number;
}

interface HourRulerSegment extends Segment {
  time: string;
}

interface DayRulerSegment extends Segment {
  date: Date;
  hourSegments: HourRulerSegment[];
}

const resolveHourRulerSegment = (
  start: DateTime,
  end: DateTime,
  locale: string,
  timeFormat: TimeFormat
): HourRulerSegment[] => {
  const segments: HourRulerSegment[] = [];

  let cursor = start.startOf("hour");
  // eslint-disable-next-line
  while (cursor < end) {
    const nextCursor = cursor.plus({ hours: 1 });
    const segmentStart = cursor < start ? start : cursor;
    const segmentEnd = nextCursor > end ? end : nextCursor;
    const formattedHour = segmentStart
      .setLocale(locale)
      .toLocaleParts({
        hour: "2-digit",
        hourCycle:
          timeFormat === TimeFormat.System
            ? undefined
            : timeFormat === TimeFormat.Hour12
            ? "h12"
            : "h23",
      })
      .find((part) => part.type === "hour")?.value;

    segments.push({
      start: segmentStart.diff(start).as("minutes"),
      duration: segmentEnd.diff(segmentStart).as("minutes"),
      time: formattedHour || segmentStart.toFormat("HH"),
    });

    cursor = nextCursor;
  }

  return segments;
};

const resolveDayRulerSegments = (
  start: DateTime,
  end: DateTime,
  locale: string,
  timeFormat: TimeFormat
): DayRulerSegment[] => {
  const segments: DayRulerSegment[] = [];

  let dayCursor = start.startOf("day");
  // eslint-disable-next-line
  while (dayCursor < end) {
    const nextDayCursor = dayCursor.plus({ days: 1 });
    const segmentStart = dayCursor < start ? start : dayCursor;
    const segmentEnd = nextDayCursor > end ? end : nextDayCursor;

    segments.push({
      start: segmentStart.diff(start).as("minutes"),
      duration: segmentEnd.diff(segmentStart).as("minutes"),
      date: segmentStart.toJSDate(),
      hourSegments: resolveHourRulerSegment(
        segmentStart,
        segmentEnd,
        locale,
        timeFormat
      ),
    });

    dayCursor = nextDayCursor;
  }

  return segments;
};

const resolveRulerSegments = (
  locale: string,
  timeFormat: TimeFormat
): DayRulerSegment[] => {
  const { total: timelineDates } = getTimelineDates();
  return resolveDayRulerSegments(
    timelineDates.start,
    timelineDates.end,
    locale,
    timeFormat
  );
};

interface Props {
  baseTime: Date | null;
}

const RawTimelineRuler: React.FunctionComponent<Props> = (props) => {
  const { baseTime } = props;
  const initialSegments = resolveRulerSegments(
    defaultLocale,
    TimeFormat.System
  );
  const [segments, setSegments] = useState<DayRulerSegment[]>(initialSegments);
  const { locale } = useIntl();
  const [timeFormat] = useUserSetting<TimeFormat>(SettingKey.TimeFormat);

  const updateSegment = useCallback(() => {
    const newSegments = resolveRulerSegments(locale, timeFormat);
    setSegments(newSegments);
  }, [locale, timeFormat]);

  useEffect(updateSegment, [updateSegment]);
  useScheduleJob(everyMinuteSchedule, updateSegment, [updateSegment]);

  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up("sm"));

  const i18n = useIntl();
  return (
    <Paper
      sx={{
        backgroundColor: "background.default",
        py: 1,
        px: 0,
      }}
      elevation={0}
    >
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <TimelineRulerTime baseTime={baseTime} />
      </Box>
      <Box
        sx={{
          display: "flex",
          color: "text.disabled",
        }}
      >
        {segments.map((daySegment) => {
          return (
            <Box
              key={daySegment.date.toISOString()}
              sx={{
                borderLeft: (theme) =>
                  `1px solid ${theme.palette.text.secondary}`,
                width: `${
                  (daySegment.duration * 100) / timelineSizeInMinutes
                }%`,
              }}
            >
              <FluidTypography
                {...dayFluidText}
                sx={{
                  paddingLeft: "0.25em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textTransform: "capitalize",
                  lineHeight: "1.075",
                  height: "1.075em",
                  margin: "0.4em 0",
                }}
              >
                {i18n.formatDate(daySegment.date, {
                  weekday: "long",
                })}
              </FluidTypography>

              <Box
                sx={{
                  display: "flex",
                }}
              >
                {daySegment.hourSegments.map((hourSegment) => {
                  return (
                    <FluidTypography
                      key={hourSegment.start}
                      {...hourFluidText}
                      sx={{
                        "width": `${
                          (hourSegment.duration * 100) / daySegment.duration
                        }%`,
                        "paddingLeft": "0.25em",
                        "whiteSpace": "nowrap",
                        "overflow": "hidden",
                        "textOverflow": "ellipsis",
                        "lineHeight": "1.075",
                        "height": "1.075em",
                        "margin": "0.4em 0",
                        "borderLeft": `1px solid ${theme.palette.text.secondary}`,
                        "&:first-of-type": {
                          borderLeft: "none",
                        },
                      }}
                    >
                      {smUp ? hourSegment.time : "\u00A0"}
                    </FluidTypography>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export const TimelineRuler = React.memo(RawTimelineRuler);
