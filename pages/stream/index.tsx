import { Player, useCreateStream } from '@livepeer/react';

import { useMemo, useState, useEffect } from 'react';

export default function Stream() {
    const [streamName, setStreamName] = useState<string>('');
    const [record, setRecord] = useState(false);
    const {
        mutate: createStream,
        data: stream,
        status,
    } = useCreateStream(streamName ? { name: streamName, record: record } : null);

    const isLoading = useMemo(() => status === 'loading', [status]);

    useEffect(() => {
        console.log(stream);
        // add required props to query builder
    }, [stream])

    return (
        <div style={{ "padding": "10px" }}>
            <input
                type="text"
                placeholder="Stream name"
                onChange={(e) => setStreamName(e.target.value)}
            />
            <p>Record <input type="checkbox" onChange={() => setRecord(!record)} /></p>
            {stream?.playbackId && (
                <><div style={{ "width": "50%", "height": "50%" }}><Player
                    title={stream?.name}
                    playbackId={stream?.playbackId}
                    autoPlay
                    muted
                /></div>
                    <div>
                        <p>Stream URL : rtmp://rtmp.livepeer.com/live</p>
                        {/* <p>Stream URL : {stream?.rtmpIngestUrl}</p> */}
                        <p>Stream Key : {stream?.streamKey}</p>
                        <p>Playback URL : {stream?.playbackUrl}</p>
                    </div>
                </>
            )}

            <div>
                {!stream && (
                    <button
                        style={{ border: "1px solid black" }}
                        onClick={() => {
                            createStream?.();
                        }}
                        disabled={isLoading || !createStream}
                    >
                        Create Stream
                    </button>
                )}
            </div>
        </div>
    );
};