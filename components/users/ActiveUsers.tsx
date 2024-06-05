import { useOthers, useSelf } from "@/liveblocks.config";
import { Avatar } from "./Avatar";
import styles from "./index.module.css"
import { generateRandomName } from "@/lib/utils";
import { useMemo } from "react";

export default function ActiveUsers() {
    const users = useOthers();
    const currentUser = useSelf();
    const hasMoreUsers = users.length > 3;

    const memoizedUsers = useMemo(()=>{
      return (
          <main className="py-2 flex item-center justify-center gap-1">
            <div className="flex pl-3">
              {currentUser && (
                  <Avatar otherStyles="border-[3px] border-primary-green" name="You" />
              )}
              {users.slice(0, 3).map(({ connectionId }) => {
                return (
                  <Avatar key={connectionId}  name={generateRandomName()} otherStyles="-ml-3" />
                );
              })}
      
              {hasMoreUsers && <div className={styles.more}>+{users.length - 3}</div>}
      
            </div>
        </main>
    )},[users.length])
  
    return memoizedUsers
  }