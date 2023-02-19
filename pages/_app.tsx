import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import { Chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, goerli } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import Navbar from "../components/Navbar";
import {
  LivepeerConfig,
  createReactClient,
  studioProvider,
} from '@livepeer/react';
import * as React from 'react';

const livepeerClient = createReactClient({
  provider: studioProvider({
    apiKey: "4559e244-d59a-421d-8cb7-a113654890ad",
  }),
});

const hyperspace: Chain = {
  id: 3141,
  name: 'Filecoin',
  network: 'Filecoin - Hyperspace testnet',
  nativeCurrency: {
    decimals: 1,
    name: 'Test FIL',
    symbol: 'tFIL',
  },
  rpcUrls: {
    default: {
      http: ['https://api.hyperspace.node.glif.io/rpc/v1'],
    },
  },
  blockExplorers: {
    default: { name: 'hyperspace', url: 'https://hyperspace.filfox.info/en' },
    etherscan: { name: 'hyperspace', url: 'https://hyperspace.filfox.info/en' },
  },
  testnet: true,
};

const { chains, provider, webSocketProvider } = configureChains(
  [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    goerli,
    hyperspace
  ],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "ScheduleMate",
  chains,
});

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
