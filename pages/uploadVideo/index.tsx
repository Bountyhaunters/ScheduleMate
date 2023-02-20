import { Player, useAsset, useAssetMetrics, useCreateAsset, useUpdateAsset } from '@livepeer/react';
import { useAccount, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { videoNftAbi } from './videoNftAbi';

export default function Asset() {
    const { address } = useAccount();
    const [video, setVideo] = useState<File | undefined>();
    const [assetId, setAssetId] = useState("");
    const {
        mutate: createAsset,
        data: asset,
        status,
        progress,
        error,
    } = useCreateAsset(
        video
            ? {
                sources: [{ name: video.name, file: video }] as const,
            }
            : null,
    );
    const { data: metrics } = useAssetMetrics({
        assetId: assetId,
        refetchInterval: 30000,
    });

    useEffect(() => {
        if (asset) {
            setAssetId(asset?.[0].id);
        }
    }, [asset])

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles.length > 0 && acceptedFiles?.[0]) {
            setVideo(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'video/*': ['*.mp4'],
        },
        maxFiles: 1,
        onDrop,
    });

    const { data: assetMint } = useAsset({
        assetId,
        enabled: assetId.length === 36,
        refetchInterval: (asset) =>
            asset?.storage?.status?.phase !== 'ready' ? 5000 : false,
    });

    const isLoading = useMemo(
        () =>
            status === 'loading' ||
            (asset?.[0] && asset[0].status?.phase !== 'ready'),
        [status, asset],
    );

    const progressFormatted = useMemo(
        () =>
            progress?.[0].phase === 'failed'
                ? 'Failed to process video.'
                : progress?.[0].phase === 'waiting'
                    ? 'Waiting...'
                    : progress?.[0].phase === 'uploading'
                        ? `Uploading: ${Math.round(progress?.[0]?.progress * 100)}%`
                        : progress?.[0].phase === 'processing'
                            ? `Processing: ${Math.round(progress?.[0].progress * 100)}%`
                            : null,
        [progress],
    );

    const { mutate: updateAsset } = useUpdateAsset(
        assetMint
            ? {
                assetId: assetMint.id,
                storage: {
                    ipfs: true
                },
            }
            : null,
    );

    const { config } = usePrepareContractWrite({
        // The demo NFT contract address on Polygon Mumbai
        address: '0xC02dffb6ddE184289b52C343697FE39464c45A36',
        abi: videoNftAbi,
        // Function on the contract
        functionName: 'safeMint',
        // Arguments for the mint function
        args:
            address && assetMint?.storage?.ipfs?.nftMetadata?.url
                ? [address, assetMint?.storage?.ipfs?.nftMetadata?.url]
                : undefined,
        enabled: Boolean(address && assetMint?.storage?.ipfs?.nftMetadata?.url),
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
    }, [contractWriteData])

    return (
        <div>
            {!asset && (
                <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <p>Drag and drop or browse files</p>

                    {error?.message && <p>{error.message}</p>}
                </div>
            )}

            {address && assetMint && (
                <>
                    <p>{assetId}</p>
                    {assetMint?.status?.phase === 'ready' &&
                        assetMint?.storage?.status?.phase !== 'ready' ? (
                        <button
                            onClick={() => {
                                updateAsset?.();
                            }}
                        >
                            Upload to IPFS
                        </button>
                    ) : contractWriteData?.hash && isSuccess ? (
                        <a
                            target="_blank"
                            href={`https://hyperspace.filfox.info/en/message/${contractWriteData.hash}`}
                        >
                            <button>View Mint Transaction</button>
                        </a>
                    ) : contractWriteError ? (
                        <p>{contractWriteError.message}</p>
                    ) : assetMint?.storage?.status?.phase === 'ready' && write ? (
                        <button
                            onClick={() => {
                                write();
                            }}
                        >
                            Mint NFT
                        </button>
                    ) : (
                        <></>
                    )}
                </>
            )}

            <div>
                {metrics?.metrics?.[0] && (
                    <p>Views: {metrics?.metrics?.[0]?.startViews}</p>
                )}

                {video ? <p>{video.name}</p> : <p>Select a video file to upload.</p>}

                {progressFormatted && <p>{progressFormatted}</p>}

                {!assetId && (
                    <button
                        onClick={() => {
                            createAsset?.();
                        }}
                        disabled={isLoading || !createAsset}
                    >
                        Upload
                    </button>
                )}
            </div>
        </div>
    );
};