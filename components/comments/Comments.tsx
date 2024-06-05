"use client"

import { ClientSideSuspense } from '@liveblocks/react'
import { CommentsOverlay } from './CommentsOverlay'
import Loader from '../Loader'

export const Comments = () => {
  return (
    <ClientSideSuspense fallback={null}>
        {()=> <CommentsOverlay/>}
    </ClientSideSuspense>
  )
}

