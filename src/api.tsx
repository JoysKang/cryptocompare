import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

let cryptos = "BTC,ETH,USDT";
export const cryptoList: string[] = ["BTC", "ETH", "USDT"];
const fiats = "USD,EUR,AUD,CNY";
const fiatSymbol = {
  USD: "$",
  EUR: "€",
  AUD: "A$",
  CNY: "¥",
};

const instance = axios.create({
  baseURL: "https://min-api.cryptocompare.com/data/pricemulti?tsyms=" + fiats + "&fsyms=" + cryptos,
  headers: { "Content-type": "application/json" },
});

const responseBody = (response: AxiosResponse) => response.data;

const requests = {
  get: (url: string, config: AxiosRequestConfig = {}) => instance.get(url, config).then(responseBody),
};

/**
 * Fetches data based on the specified search criteria.
 *
 * @param {string} searchCryptos - The search criteria for cryptos.
 * @return {Promise<Array>} An array of new price data.
 */
export async function fetchData(searchCryptos: string) {
  try {
    if (searchCryptos) {
      // 单次搜索多个交易对
      if (searchCryptos.includes(",")) {
        searchCryptos.split(",").map((item) => {
          cryptoList.push(item.toUpperCase());
          cryptos += "," + searchCryptos;
        });
      } else {
        searchCryptos = searchCryptos.toUpperCase();
        cryptoList.push(searchCryptos);
        cryptos += "," + searchCryptos;
      }
    }
    // console.log("https://min-api.cryptocompare.com/data/pricemultifull?tsyms=" + fiats + "&fsyms=" + cryptos);
    const response = await requests.get(
      "https://min-api.cryptocompare.com/data/pricemultifull?tsyms=" + fiats + "&fsyms=" + cryptos
    );

    // console.log(JSON.stringify(response));
    if (!response) {
      console.log(JSON.stringify(response));
      return [];
    }

    const newPriceData = cryptoList.map((item) => {
      let priceStr = "";
      let icon = "";
      const crypto = response.RAW[item];
      if (crypto === undefined) {
        return { icon: "not-found.png", name: item, price: "Price not found." };
      }

      for (const [key, value] of Object.entries(fiatSymbol)) {
        if (key in crypto && crypto[key]) {
          priceStr += value + crypto[key].PRICE + "  ";
          icon = "https://cryptocompare.com" + crypto[key].IMAGEURL;
        }
      }

      return { icon: icon, name: item, price: priceStr };
    });

    return newPriceData;
  } catch (e) {
    console.log(e);
    return [];
  }
}
