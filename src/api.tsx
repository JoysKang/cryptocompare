import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const cryptos = "BTC,ETH,USDT";
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

export async function fetchData(searchCryptos: string) {
  try {
    let response: AxiosResponse;
    if (!searchCryptos || searchCryptos == undefined) {
      response = await requests.get(
        "https://min-api.cryptocompare.com/data/pricemultifull?tsyms=" + fiats + "&fsyms=" + cryptos
      );
    } else {
      searchCryptos = searchCryptos.toUpperCase();
      console.log(
        "88888",
        searchCryptos,
        "https://min-api.cryptocompare.com/data/pricemultifull?tsyms=" +
          fiats +
          "&fsyms=" +
          cryptos +
          "," +
          searchCryptos
      );
      cryptoList.push(searchCryptos);
      console.log(cryptoList);
      response = await requests.get(
        "https://min-api.cryptocompare.com/data/pricemultifull?tsyms=" +
          fiats +
          "&fsyms=" +
          cryptos +
          "," +
          searchCryptos
      );
    }

    // console.log(JSON.stringify(response));
    if (!response) {
      console.log(JSON.stringify(response));
      return [];
    }

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

    return newPriceData;
  } catch (e) {
    console.log(e);
    return [];
  }
}
