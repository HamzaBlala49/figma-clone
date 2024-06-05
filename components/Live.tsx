"use client";

import React, { RefObject, useCallback, useEffect, useState } from 'react'
import LiveCursors from './cusors/LiveCursors'
import { useBroadcastEvent, useEventListener, useMyPresence} from '@/liveblocks.config'
import CursorChat from './cusors/CursorChat'
import { CursorMode, CursorState, Reaction} from '@/types/type'
import FlyingReaction from './reaction/FlyingReaction'
import ReactionSelector from './reaction/ReactionButton'
import useInterval from '@/hooks/useInterval'
import {Comments} from './comments/Comments'
import {ContextMenu,ContextMenuContent,ContextMenuItem,ContextMenuTrigger} from "@/components/ui/context-menu"
import { shortcuts } from '@/constants'

type Props = {
    canvasRef :  React.MutableRefObject<HTMLCanvasElement | null>,
    undo:()=> void,
    redo:()=> void,
}

export const Live = ({canvasRef,undo,redo}:Props) => {
    const [{cursor},updateMyPresence] = useMyPresence()
    const [reactions, setReactions] = useState<Reaction[]>([])
    const [cursorState, setCursorState] = useState<CursorState>({
        mode:CursorMode.Hidden
    })

    const broadcast = useBroadcastEvent()

    // for remove the reactions from state 
    useInterval(()=>{
        setReactions((reaction)=> reaction.filter((r)=> r.timestamp > Date.now() - 4000))
    },1000)

    useInterval(()=>{
        if(cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor){
            setReactions((reactions) => reactions.concat([{
                point:{x:cursor.x,y:cursor.y},
                value:cursorState.reaction,
                timestamp:Date.now()
            }]))

            broadcast({
                x: cursor.x,
                y: cursor.y,
                value:cursorState.reaction,
            })
        }
    },100)

    useEventListener((eventData)=>{
        const event = eventData.event;
        
        setReactions((reactions) => reactions.concat([{
            point:{x: event.x, y: event.y},
            value:event.value,
            timestamp:Date.now()
        }]))
    })

    const handelPointerMove = useCallback((event:React.PointerEvent)=>{
        event.preventDefault()
        if(cursor == null || cursorState.mode !== CursorMode.ReactionSelector){
            const x = event.clientX - event.currentTarget.getBoundingClientRect().x
            const y = event.clientY - event.currentTarget.getBoundingClientRect().y
            updateMyPresence({cursor : { x,y }})
        }

    }, [])

    const handelPointerUp = useCallback((event:React.PointerEvent)=>{
        setCursorState((state:CursorState)=> cursorState.mode === CursorMode.Reaction ? {...state,isPressed:true} : state)
    }, [cursorState.mode,setCursorState])

    const handelPointerDown = useCallback((event:React.PointerEvent)=>{
        const x = event.clientX - event.currentTarget.getBoundingClientRect().x
        const y = event.clientY - event.currentTarget.getBoundingClientRect().y
        updateMyPresence({cursor : { x,y }})
        setCursorState((state:CursorState)=> cursorState.mode === CursorMode.Reaction ? {...state,isPressed:true} : state)

    },[cursorState.mode,setCursorState])

    const handelPointerLeave = useCallback((event:React.PointerEvent)=>{
        setCursorState({mode:CursorMode.Hidden})
        updateMyPresence({cursor:null,message:null})
    }, [])

    useEffect(()=>{
        const onKeyUp = (e: KeyboardEvent) => {
            if(e.key === "/"){
                setCursorState({
                    mode: CursorMode.Chat,
                    previousMessage: null,
                    message: "",
                })
            }else if(e.key === "Escape"){
                updateMyPresence({message:""})
                setCursorState({mode:CursorMode.Hidden})
            }else if(e.key === "e"){
                console.log(e.key)
                setCursorState({ mode: CursorMode.ReactionSelector });
            }

        }
        const onKeyDown = (e: KeyboardEvent) => {
            if(e.key === "/"){
                e.preventDefault()
            }
        }

        window.addEventListener("keydown",onKeyDown)
        window.addEventListener("keyup",onKeyUp)

        return ()=>{  
            window.removeEventListener("keydown",onKeyDown)
            window.removeEventListener("keyup",onKeyUp)
        }
    },[updateMyPresence])

    const setReaction = useCallback((reaction:string)=> {
        setCursorState({
            mode:CursorMode.Reaction,
            reaction,
            isPressed:false
        })
    },[])

    const handleContextMenuClick = useCallback((key:string)=>{
        switch (key) {
            case "Chat" :
                setCursorState({
                    mode: CursorMode.Chat,
                    previousMessage: null,
                    message: ""
                })
                break;
            case "Undo" :
                undo()
            break;

            case "Redo" :
                redo()
            break;

            case "Reactions" :
                setCursorState({
                    mode:CursorMode.ReactionSelector,
                })
            break;

            default:
                break;
        }
    },[])

  return (
    <ContextMenu>
        <ContextMenuTrigger
            id='canvas'
            onPointerMove={handelPointerMove}
            onPointerDown={handelPointerDown}
            onPointerLeave={handelPointerLeave}
            onPointerUp={handelPointerUp}
            className=" relative h-full w-full flex flex-1 justify-center items-center"
        >
            <canvas ref={canvasRef} />

            {reactions.map((r)=>(
                <FlyingReaction
                    key={r.timestamp.toString()}
                    x={r.point.x}
                    y={r.point.y}
                    timestamp={r.timestamp}
                    value={r.value}
                />
            ))}

            { cursor && (
                <CursorChat
                    cursor={cursor}
                    cursorState={cursorState}
                    setCursorState={setCursorState}
                    updateMyPresence={updateMyPresence}
                />
            )}

            {cursorState.mode === CursorMode.ReactionSelector && (
                <ReactionSelector
                    setReaction = {setReaction}
                />
            )}

            <LiveCursors/> 

            <Comments/>
        </ContextMenuTrigger>
        <ContextMenuContent className='right-menu-content' >
            {shortcuts.map((item)=>(
                <ContextMenuItem key={item.key}
                className='right-menu-item' 
                 onClick={ ()=> handleContextMenuClick(item.name)}
                >
                    <p>{item.name}</p>
                    <p className='text-xs text-primary-grey-300'>{item.shortcut}</p>
                </ContextMenuItem>
            ))} 
        </ContextMenuContent>
    </ContextMenu>
  )
}
