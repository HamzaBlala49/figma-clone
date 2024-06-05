"use client";

import { useCallback, useRef } from "react";
import { ThreadData } from "@liveblocks/client";

import { ThreadMetadata, useEditThreadMetadata, useThreads, useUser } from "@/liveblocks.config";
import { useMaxZIndex } from "@/lib/useMaxZIndex";

import { PinnedThread } from "./PinnedThread";

type OverlayThreadProps = {
  thread: ThreadData<ThreadMetadata>;
  maxZIndex: number;
};

export const CommentsOverlay = () => {
  /**
   * We're using the useThreads hook to get the list of threads
   * in the room.
   *
   * useThreads: https://liveblocks.io/docs/api-reference/liveblocks-react#useThreads
   */
  const { threads } = useThreads();

  // get the max z-index of a thread
  const maxZIndex = useMaxZIndex();

  return (
    <div>
      {threads
        .filter((thread) => !thread.metadata.resolved )
        .map((thread) => <OverlayThread key={thread.id} thread={thread} maxZIndex={maxZIndex} />)}
    </div>
  );
};

const OverlayThread = ({ thread, maxZIndex }: OverlayThreadProps) => {
  /**
   * We're using the useEditThreadMetadata hook to edit the metadata
   * of a thread.
   *
   * useEditThreadMetadata: https://liveblocks.io/docs/api-reference/liveblocks-react#useEditThreadMetadata
   */
  const editThreadMetadata = useEditThreadMetadata();

  // const userId = thread.comments[0].userId

  // const user = useUser("EdCRRW4oNr9EfV0uYR_AZh5dRR");
  // console.log(user)

  const threadRef = useRef<HTMLDivElement>(null);

  // If other thread(s) above, increase z-index on last element updated
  const handleIncreaseZIndex = useCallback(() => {
    if (maxZIndex === thread.metadata.zIndex) {
      return;
    }

    // Update the z-index of the thread in the room
    editThreadMetadata({
      threadId: thread.id,
      metadata: {
        zIndex: maxZIndex + 1,
      },
    });
  }, [thread, editThreadMetadata, maxZIndex]);

  // if (isLoading) {
  //   return null;
  // }

  return (
    <div
      ref={threadRef}
      id={`thread-${thread.id}`}
      className="absolute left-0 top-0 flex gap-5"
      style={{
        transform: `translate(${thread.metadata.x}px, ${thread.metadata.y}px)`,
      }}
    >
      {/* render the thread */}
      <PinnedThread thread={thread} onFocus={handleIncreaseZIndex} />
    </div>
  );
};