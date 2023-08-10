import { LocalStorage } from "@raycast/api";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

let cryptos = "BTC,ETH,USDT";
export let cryptoList: string[] = [];
// export let useEffectDeps = 0;
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
  console.log(favoriteCrypto, "1111");
  if (favoriteCrypto.length === 0) {
    cryptoList = ["BTC", "ETH", "USDT"];
    console.log("初次调用");
    await LocalStorage.setItem("favoriteCrypto", "BTC,ETH,USDT");
  } else {
    console.log("非初次调用");
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
      console.log(item, favoriteCrypto.includes(item), "0000");
      const favorite = favoriteCrypto.includes(item);
      if (crypto === undefined) {
        return { icon: "not-found.png", name: item, price: "Price not found.", favorite: favorite };
      }

      for (const [key, value] of Object.entries(fiatSymbol)) {
        if (key in crypto && crypto[key]) {
          priceStr += value + crypto[key].PRICE + "  ";
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
  console.log("addFavoriteCrypto 调用");
  crypto = crypto.toUpperCase();
  const favoriteCrypto = await getFavoriteCrypto();
  if (favoriteCrypto.length === 0) {
    await LocalStorage.setItem("favoriteCrypto", crypto);
  } else {
    favoriteCrypto.push(crypto);
    await LocalStorage.setItem("favoriteCrypto", favoriteCrypto.join(","));
  }
  // useEffectDeps += 1;
  // console.log("useEffectDeps 反转");
}
