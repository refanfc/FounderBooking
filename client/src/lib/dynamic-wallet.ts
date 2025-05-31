import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";

export const dynamicEnvironmentId = import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID || "live_default";

// Dynamic.xyz configuration
export const dynamicSettings = {
  environmentId: dynamicEnvironmentId,
  walletConnectors: ["metamask", "walletconnect", "coinbase"],
  theme: "auto",
  appLogoUrl: "/logo.png",
  appName: "FarBook",
};

// Helper functions for wallet interactions
export const formatAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatBalance = (balance: string, decimals = 4) => {
  const num = parseFloat(balance);
  return num.toFixed(decimals);
};
