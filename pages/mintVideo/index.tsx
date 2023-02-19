import { useAsset, useUpdateAsset } from "@livepeer/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/router";

import { useEffect, useMemo } from "react";
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";

import { videoNftAbi } from "./videoNftAbi";

export default function WagmiNft() {
  const { address } = useAccount();
  const router = useRouter();

  const assetId = useMemo(
    () => (router?.query?.id ? String(router?.query?.id) : undefined),
    [router?.query]
  );

  const { data: asset } = useAsset({
    assetId,
    enabled: assetId?.length === 36,
    refetchInterval: (asset) => (asset?.storage?.status?.phase !== "ready" ? 5000 : false),
  });

  const { mutate: updateAsset } = useUpdateAsset(
    asset
      ? {
          assetId: asset.id,
          storage: {
            ipfs: true,
          },
        }
      : null
  );

  const { config } = usePrepareContractWrite({
    address: "0xC02dffb6ddE184289b52C343697FE39464c45A36",
    abi: videoNftAbi,
    functionName: "safeMint",
    args:
      address && asset?.storage?.ipfs?.nftMetadata?.url
        ? [address, asset?.storage?.ipfs?.nftMetadata?.url]
        : undefined,
    enabled: Boolean(address && asset?.storage?.ipfs?.nftMetadata?.url),
  });

  const {
    data: contractWriteData,
    isSuccess,
    write,
    error: contractWriteError,
  } = useContractWrite(config);

  useEffect(() => {
    if (contractWriteData) {
      console.log(contractWriteData.hash);
    }
  }, [contractWriteData]);

  return (
    <div>
      <ConnectButton />
      {address && assetId && (
        <>
          <p>{assetId}</p>
          {asset?.status?.phase === "ready" && asset?.storage?.status?.phase !== "ready" ? (
            <button onClick={updateAsset}>Upload to IPFS</button>
          ) : contractWriteData?.hash && isSuccess ? (
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://hyperspace.filfox.info/en/message/${contractWriteData.hash}`}
            >
              <button>View Mint Transaction</button>
            </a>
          ) : contractWriteError ? (
            <p>{contractWriteError.message}</p>
          ) : asset?.storage?.status?.phase === "ready" && write ? (
            <button onClick={() => write()}>Mint NFT</button>
          ) : (
            <></>
          )}
        </>
      )}
    </div>
  );
}
