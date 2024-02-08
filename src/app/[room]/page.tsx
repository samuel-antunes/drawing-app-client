"use client";

import { FC, useCallback, useEffect, useState } from "react";
import { useDraw } from "../../hooks/useDraw";
// @ts-ignore
import { ChromePicker } from "react-color";

import { io } from "socket.io-client";
import { drawLine } from "../../utils/drawLine";
import { HexColorPicker } from "react-colorful";
import { PageProps } from "../../../.next/types/app/layout";

const socket = io("http://localhost:3010");

interface pageProps {}

type DrawLineProps = {
  prevPoint: Point | null;
  currentPoint: Point;
  color: string;
};

type message = {
  content: string;
  author: string | null;
};

function Page<FC>({ params }: { params: { room: string } }) {
  const [color, setColor] = useState<string>("#000000");
  const { canvasRef, onMouseDown, clear } = useDraw(createLine);
  const [messages, setMessages] = useState<message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");

    socket.emit("client-ready");
    socket.emit("join-room", { username: "user", roomID: params.room });

    socket.on("get-canvas-state", () => {
      if (!canvasRef.current?.toDataURL()) return;

      socket.emit("canvas-state", {
        canvasRef: canvasRef.current.toDataURL(),
        roomID: params.room,
      });
    });

    socket.on(
      "draw-line",
      ({ prevPoint, currentPoint, color }: DrawLineProps) => {
        if (!ctx) return console.log("no ctx here");
        drawLine({ prevPoint, currentPoint, ctx, color });
      }
    );

    socket.on("canvas-state-from-server", (state: string) => {
      const img = new Image();
      img.src = state;
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
      };
    });

    socket.on("clear", clear);

    return () => {
      socket.off("get-canvas-state");
      socket.off("canvas-state-from-server");
      socket.off("clear");
      socket.off("draw-line");
    };
  }, [canvasRef]);

  useEffect(() => {
    socket.on("receive-message", ({ content, roomID, author }: any) => {
      setMessages((prevMessages) => [...prevMessages, { content, author }]);
    });
    return () => {
      socket.off("receive-message");
    };
  }, [socket]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return; // Prevent sending empty messages
    const author = localStorage.getItem("username")
      ? localStorage.getItem("username")
      : "";
    setMessages([
      ...messages,
      {
        content: newMessage,
        author: author,
      },
    ]);

    sendNewMessage(newMessage);
    setNewMessage(""); // Clear input after sending
  };

  const sendNewMessage = useCallback(
    (newMessage: string) => {
      socket.emit("send-message", {
        content: newMessage,
        roomID: params.room,
        author: localStorage.getItem("username"),
      });
    },
    [socket]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  function createLine({ prevPoint, currentPoint, ctx }: Draw) {
    socket.emit("draw-line", {
      prevPoint,
      currentPoint,
      color,
      roomID: params.room,
    });
    drawLine({ prevPoint, currentPoint, ctx, color });
  }

  return (
    <div className="w-[100%] h-[100%] md:h-screen md:w-screen bg-[#34373d] flex flex-col md:flex-row justify-center items-center">
      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        width={500}
        height={500}
        className="border border-black rounded-md bg-white"
      />
      <div className="flex flex-col p-4 md:pl-10 container w-[80%] md:w-[25%]">
        <HexColorPicker color={color} onChange={setColor} />;
        <button
          type="button"
          className="p-2 rounded-md border border-black bg-white mt-[-20px]"
          onClick={() => socket.emit("clear")}
        >
          Clear
        </button>
        {/* <div className="h-full bg-white mt-[10px] h-[200px]">
          {messages.map((message: string) => {
            return <h1>{message}</h1>;
          })}
          <div className=""></div>
        </div> */}
        <div className="flex flex-col justify-between h-[240px] bg-white mt-[10px] p-4 border rounded-md">
          <div className=" overflow-y-scroll h-[80%]">
            {messages.map((message, index) => (
              <h1 key={index} className="break-words">
                {message.author ? message.author : "anonymous"}
                {": "}
                {message.content}
              </h1>
            ))}
          </div>
          <div className="mt-4 flex flex-row">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="border rounded-md border-gray-400 p-2 w-full"
              placeholder="Type a message..."
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
