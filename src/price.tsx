import { List, Action, ActionPanel } from "@raycast/api";
import { useEffect, useState } from "react";
import { fetchData } from "./api";

interface Data {
  icon: string;
  name: string;
  price: string;
}

export default function Command() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [priceData, setPriceData] = useState<Data[]>([]);

  useEffect(() => {
    async function fetchDataAsync() {
      const newPriceData = await fetchData("");
      setPriceData(newPriceData);
      setIsLoading(false);
    }

    fetchDataAsync();
  }, []);

  return (
    <List
      isLoading={isLoading}
      filtering={false}
      onSearchTextChange={async (SearchText) => {
        setIsLoading(true);
        setPriceData(await fetchData(SearchText));
        setIsLoading(false);
      }}
      throttle={true}
      searchBarPlaceholder="Search for prices of digital coins"
    >
      {priceData.map((item) => (
        <List.Item
          key={item.name}
          title={item.name}
          icon={{ source: item.icon }}
          subtitle={item.price}
          actions={
            <ActionPanel>
              <Action.CopyToClipboard title="Copy Price" content={item.price} onCopy={() => item.price} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
