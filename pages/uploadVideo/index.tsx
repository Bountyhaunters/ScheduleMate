import { Player, useAssetMetrics, useCreateAsset } from '@livepeer/react';
import router, { Router } from 'next/router';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';

export default function Asset() {
    const [video, setVideo] = useState<File | undefined>();
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
        assetId: asset?.[0].id,
        refetchInterval: 30000,
    });

    useEffect(() => {
        if (asset) {
            console.log(asset?.[0].id)
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

    function mintNft(assetId: string){

    }

    return (
        <div>
            {!asset && (
                <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <p>Drag and drop or browse files</p>

                    {error?.message && <p>{error.message}</p>}
                </div>
            )}

            {asset?.[0]?.playbackId && (
                <>
                    <Player title={asset[0].name} playbackId={asset[0].playbackId} />
                    <button onClick={() => {
                        mintNft(asset[0].id);
                    }}
                    > Mint Video !</button>
                </>
            )}

            <div>
                {metrics?.metrics?.[0] && (
                    <p>Views: {metrics?.metrics?.[0]?.startViews}</p>
                )}

                {video ? <p>{video.name}</p> : <p>Select a video file to upload.</p>}

                {progressFormatted && <p>{progressFormatted}</p>}

                {!asset?.[0].id && (
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