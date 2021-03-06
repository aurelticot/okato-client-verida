import React, { useState } from "react";
import {
  Box,
  List,
  ListItemText,
  ListItem,
  ListItemSecondaryAction,
  ListSubheader,
  Switch,
  Typography,
} from "@mui/material";
import { Room as LocationIcon } from "@mui/icons-material";
import { useIntl } from "react-intl";
import { Markets_markets_result as Market } from "lib/graphql/queries/Markets/types/Markets";
import { MarketSelectionSearch } from "components/molecules";
import { MarketSelectionListSkeleton } from "components/organisms";

const filterMarket = (query = "", market: Market) => {
  const queryLower = query.toLowerCase();
  if (query.length < 1) {
    return true;
  }
  const name = market.name.toLowerCase().includes(queryLower);
  const shortName = market.shortName.toLowerCase().includes(queryLower);
  const city = market.city.toLowerCase().includes(queryLower);
  if (name || shortName || city) {
    return true;
  }
  return false;
};

interface Props {
  markets: Market[] | null;
  selection: string[];
  onSelection: (marketId: string) => void;
}

export const MarketSelectionList: React.FunctionComponent<Props> = ({
  markets,
  selection,
  onSelection,
}) => {
  const i18n = useIntl();
  const [query, setQuery] = useState("");

  if (!markets) {
    return (
      <List sx={{ p: 0 }}>
        <MarketSelectionListSkeleton />
      </List>
    );
  }

  const getDefaultItem = (message: string, key: string) => (
    <ListItem key={key} sx={{ display: "flex", justifyContent: "center" }}>
      <Box>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontStyle: "italic",
          }}
        >
          {message}
        </Typography>
      </Box>
    </ListItem>
  );

  const getMarketItem = (market: Market) => {
    const itemId = `switch-list-label-${market.id}`;
    return (
      <ListItem key={market.id}>
        <ListItemText
          id={itemId}
          primary={`${market.shortName} - ${market.name}`}
          secondary={
            <Box
              component={"span"}
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <LocationIcon
                sx={{
                  fontSize: "0.875rem",
                  mr: 0.5,
                }}
              />
              {` ${market.city}`}
            </Box>
          }
        />
        <ListItemSecondaryAction>
          <Switch
            edge="end"
            color="primary"
            onChange={() => onSelection(market.id)}
            checked={selection.includes(market.id)}
            inputProps={{
              "aria-labelledby": itemId,
            }}
          />
        </ListItemSecondaryAction>
      </ListItem>
    );
  };

  const getSelectedMarkets = () => {
    const selectedMarketsListSubheader = i18n.formatMessage({
      id: "MarketSelectionList.selectedMarketsListSubheader",
      defaultMessage: "Selected",
      description: "Subheader of the list containing the selected markets",
    });

    const noSelectedMarketMessage = i18n.formatMessage({
      id: "MarketSelectionList.noSelectedMarketMessage",
      defaultMessage: "No market selected yet",
      description:
        "Message appearing in market selection when the list of selected is empty",
    });

    const selectedMarkets = markets
      .filter((market) => selection.includes(market.id))
      .filter((market) => filterMarket(query, market))
      .map((market) => getMarketItem(market));

    return (
      <List
        sx={{ p: 0 }}
        subheader={
          <ListSubheader
            sx={{
              backgroundColor: "background.paper",
            }}
          >
            {selectedMarketsListSubheader}
          </ListSubheader>
        }
      >
        {selectedMarkets.length === 0
          ? getDefaultItem(noSelectedMarketMessage, "no-market-selected")
          : selectedMarkets}
      </List>
    );
  };

  const getAvailableMarkets = () => {
    const availableMarketsListSubheader = i18n.formatMessage({
      id: "MarketSelectionList.availableMarketsListSubheader",
      defaultMessage: "Available",
      description:
        "Subheader of the list containing the availabe (non-selected) markets",
    });

    const noAvailableMarketMessage = i18n.formatMessage({
      id: "MarketSelectionList.noAvailableMarketMessage",
      defaultMessage: "No other market available",
      description:
        "Message appearing in market selection when the list of available is empty",
    });

    const availableMarkets = markets
      .filter((market) => !selection.includes(market.id))
      .filter((market) => filterMarket(query, market))
      .map((market) => getMarketItem(market));

    return (
      <List
        sx={{ p: 0 }}
        subheader={
          <ListSubheader
            sx={{
              backgroundColor: "background.paper",
            }}
          >
            {availableMarketsListSubheader}
          </ListSubheader>
        }
      >
        {availableMarkets.length === 0
          ? getDefaultItem(noAvailableMarketMessage, "no-market-available")
          : availableMarkets}
      </List>
    );
  };

  return (
    <>
      <MarketSelectionSearch onSearch={setQuery} />
      {getSelectedMarkets()}
      {getAvailableMarkets()}
    </>
  );
};
