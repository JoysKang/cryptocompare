import { List, Action, ActionPanel } from "@raycast/api";
import { useEffect, useState } from "react";
import { fetchData, cryptoList } from "./api";
import { delay } from "./utils";

interface Data {
  icon: string;
  name: string;
  price: string;
}

export default function Command() {
  let changeNumber = 0;
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
      selectedItemId="USDT"
      isLoading={isLoading}
      filtering={false}
      onSearchTextChange={async (SearchText) => {
        // 实现延迟搜索
        changeNumber += 1;
        const currentChangeNumber = changeNumber;
        await delay(1000);

        // 过滤非正常搜索 + 延迟搜索
        if (
          SearchText === "" ||
          cryptoList.includes(SearchText.toUpperCase()) ||
          currentChangeNumber !== changeNumber
        ) {
          return;
        }

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
