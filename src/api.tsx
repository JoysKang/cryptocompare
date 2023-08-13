import { LocalStorage } from "@raycast/api";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { formatNumber } from "./utils";

let cryptos = "";
export let cryptoList: string[] = [];
const fiats = "USD,EUR,AUD";
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

export async function getFavoriteCrypto() {
  const cryptoListFromLocalStorage = await LocalStorage.getItem("favoriteCrypto");
  if (!cryptoListFromLocalStorage) {
    return [];
  } else if (typeof cryptoListFromLocalStorage === "string") {
    return cryptoListFromLocalStorage.split(",");
  } else {
    return [];
  }
}

// 获取 cryptoList
export async function updateCryptoList() {
  const favoriteCrypto = await getFavoriteCrypto();
  if (favoriteCrypto.length === 0) {
    cryptoList = ["BTC", "ETH", "USDT"];
    await LocalStorage.setItem("favoriteCrypto", "BTC,ETH,USDT");
  } else {
    cryptoList = [...new Set(cryptoList.concat(favoriteCrypto))];
  }
  return cryptoList;
}

/**
 * Fetches data based on the specified search criteria.
 *
 * @param {string} searchCryptos - The search criteria for cryptos.
 * @return {Promise<Array>} An array of new price data.
 */
export async function fetchData(searchCryptos: string) {
  try {
    await updateCryptoList();
    const favoriteCrypto = await getFavoriteCrypto();
    if (favoriteCrypto.length === 0) {
      cryptos = "BTC,ETH,USDT";
    } else {
      cryptos = favoriteCrypto.join(",");
    }

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
      const favorite = favoriteCrypto.includes(item);
      if (crypto === undefined) {
        return { icon: "not-found.png", name: item, price: "Price not found.", favorite: favorite };
      }

      for (const [key, value] of Object.entries(fiatSymbol)) {
        if (key in crypto && crypto[key]) {
          priceStr += value + formatNumber(crypto[key].PRICE) + "  ";
          icon = "https://cryptocompare.com" + crypto[key].IMAGEURL;
        }
      }

      return { icon: icon, name: item, price: priceStr, favorite: favorite };
    });

    return newPriceData;
  } catch (e) {
    console.log(e);
    return [];
  }
}

export async function addFavoriteCrypto(crypto: string) {
  crypto = crypto.toUpperCase();
  const favoriteCrypto = await getFavoriteCrypto();
  if (favoriteCrypto.length === 0) {
    await LocalStorage.setItem("favoriteCrypto", crypto);
  } else {
    favoriteCrypto.push(crypto);
    await LocalStorage.setItem("favoriteCrypto", favoriteCrypto.join(","));
  }
}

export async function removeFavoriteCrypto(crypto: string) {
  crypto = crypto.toUpperCase();
  const favoriteCrypto = await getFavoriteCrypto();
  if (!favoriteCrypto.includes(crypto)) {
    return;
  }
  favoriteCrypto.splice(favoriteCrypto.indexOf(crypto), 1);
  await LocalStorage.setItem("favoriteCrypto", favoriteCrypto.join(","));
}
