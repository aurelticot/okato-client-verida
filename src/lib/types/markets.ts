import { DateTime } from "luxon";
import { MarketStatus } from "./globalTypes";
import { TimelineSegment } from "./timeline";

export interface Market {
  id: string;
  mic: string;
  shortName: string;
  name: string;
  city: string;
  country: string;
  longitude: number;
  capitalisation: number | null;
  timezone: string;
  sessions: MarketSession[];
  timeline: TimelineSegment[];
}

export interface MarketSession {
  start: DateTime;
  end: DateTime;
  mainStatus: MarketStatus;
  status: MarketStatus;
  reason?: string;
}
