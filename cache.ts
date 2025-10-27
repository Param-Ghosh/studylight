import { TokenCache } from "@clerk/clerk-expo";
import * as secureStore from "expo-secure-store";
import { Platform } from "react-native";

const createTokenCache = (): TokenCache => {
  return {
    getToken: async (key: string) => {
      try {
        const item = await secureStore.getItemAsync(key);
        if (item) {
          console.log(`${key} was used\n`);
        } else {
          console.log("No values stored under key: " + key);
        }
        return item;
      } catch (error) {
        console.error("secure store get item error: ", error);
        await secureStore.deleteItemAsync(key);
        return null;
      }
    },
    saveToken: async (key: string, token: string) => {
      try {
        await secureStore.setItemAsync(key, token);
      } catch (error) {
        console.error("secure store save item error: ", error);
      }
    },
  };
};

export const tokenCache = Platform.OS !== "web" ? createTokenCache() : undefined;
