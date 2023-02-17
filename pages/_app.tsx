import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import { connectorsForWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { goerli } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { ArcanaConnector } from "@arcana/auth-wagmi";
import Navbar from "../components/Navbar";

const { chains, provider, webSocketProvider } = configureChains([goerli], [publicProvider()]);

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
        <div className="mx-auto max-w-7xl">
          <Navbar />
          <Component {...pageProps} />
        </div>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
