import { List, showToast, Toast, Action, ActionPanel } from "@raycast/api";
import { useEffect, useState } from "react";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

// 默认的数字货币
const cryptos = "BTC,ETH,USDT";
const cryptoList: string[] = ["BTC", "ETH", "USDT"];
const fiats = "USD,EUR,AUD,CNY";
const fiatSymbol = {
  USD: "$",
  EUR: "€",
  AUD: "A$",
  CNY: "¥",
};

interface Data {
  icon: string;
  name: string;
  price: string;
}

const instance = axios.create({
  baseURL: "https://min-api.cryptocompare.com/data/pricemulti?tsyms=" + fiats + "&fsyms=" + cryptos,
  headers: { "Content-type": "application/json" },
});

const responseBody = (response: AxiosResponse) => response.data;

const requests = {
  get: (url: string, config: AxiosRequestConfig = {}) => instance.get(url, config).then(responseBody),
};

export default function Command() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [priceData, setPriceData] = useState<Data[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await requests.get(
          "https://min-api.cryptocompare.com/data/pricemultifull?tsyms=" + fiats + "&fsyms=" + cryptos
        );
        const newPriceData = cryptoList.map((item) => {
          let priceStr = "";
          let icon = "";
          const crypto = response.RAW[item];
          for (const [key, value] of Object.entries(fiatSymbol)) {
            if (crypto[key]) {
              priceStr += value + crypto[key].PRICE + "  ";
              icon = "https://cryptocompare.com" + crypto[key].IMAGEURL;
            }
          }

          return { icon: icon, name: item, price: priceStr };
        });
        setPriceData(newPriceData);
      } catch (e) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to fetch the coin list" + e,
        });
      }

      setIsLoading(false);
    }

    fetchData();
  }, []);

  return (
    <List isLoading={isLoading}>
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
