import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import { connectorsForWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { Chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { ArcanaConnector } from "@arcana/auth-wagmi";
import Navbar from "../components/Navbar";
import { LivepeerConfig, createReactClient, studioProvider } from "@livepeer/react";
import * as React from "react";

const livepeerClient = createReactClient({
  provider: studioProvider({
    apiKey: "4559e244-d59a-421d-8cb7-a113654890ad",
  }),
});

const hyperspace: Chain = {
  id: 3141,
  name: "Filecoin",
  network: "Filecoin - Hyperspace testnet",
  nativeCurrency: {
    decimals: 1,
    name: "Test FIL",
    symbol: "tFIL",
  },
  rpcUrls: {
    default: {
      http: ["https://api.hyperspace.node.glif.io/rpc/v1"],
    },
  },
  blockExplorers: {
    default: { name: "hyperspace", url: "https://hyperspace.filfox.info/en" },
    etherscan: { name: "hyperspace", url: "https://hyperspace.filfox.info/en" },
  },
  testnet: true,
};

const { chains, provider, webSocketProvider } = configureChains(
  [hyperspace],
  [
    jsonRpcProvider({
      rpc: () => ({
        http: `https://api.hyperspace.node.glif.io/rpc/v1`,
      }),
    }),
  ]
);

export const ArcanaRainbowConnector = (chains: any) => {
  return {
    id: "arcana-auth",
    name: "Arcana Wallet",
    iconUrl: "https://docs.arcana.network/img/an_favicon.svg",
    iconBackground: "#ffffff",
    createConnector: () => {
      const connector = new ArcanaConnector({
        chains,
        options: {
          appId: process.env.NEXT_PUBLIC_ARCANA_APP_ID!,
        },
      });
      return {
        connector,
      };
    },
  };
};

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    //@ts-ignore
    wallets: [ArcanaRainbowConnector({ chains }), metaMaskWallet({ chains })],
  },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <LivepeerConfig client={livepeerClient}>
          <div className="mx-auto max-w-7xl">
            <Navbar />
            <Component {...pageProps} />
          </div>
        </LivepeerConfig>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
