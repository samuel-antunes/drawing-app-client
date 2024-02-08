"use client";

import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useRouter } from "next/navigation";

const socket = io(process.env.SERVER_URL || "http://localhost:3010/");

const Home = () => {
  const router = useRouter();

  const [error, setError] = useState<string>("");

  const [username, setUsername] = useState<string>("");
  const [roomID, setRoomID] = useState<string>("");
  const [selectedRoomID, setSelectedRoomID] = useState<string>("");
  const [existingRooms, setExistingRooms] = useState<string[]>([]);
  const [creatingRoom, setCreatingRoom] = useState<Boolean>(true);

  useEffect(() => {
    const fetchRooms = async () => {
      const response = await fetch(
        `${process.env.SERVER_URL || "http://localhost:3010/"}rooms`,
        {
          method: "GET",
        }
      );
      if (!response.ok) {
        console.log("Network error");
      }
      const data = await response.json();
      setExistingRooms(data.rooms);
    };

    fetchRooms();
  }, []);

  const handleJoinRoom = () => {
    const roomToJoin = creatingRoom ? roomID : selectedRoomID;

    if (!username && !roomToJoin)
      setError(
        "Please insert a username and either create or select a room to join."
      );
    else if (!username) {
      setError("Please insert a username.");
    } else if (!roomToJoin) {
      setError("Please either create or select a room to join.");
    } else {
      const data = { username: username, roomID: roomToJoin };
      const eventString = creatingRoom ? "create-room" : "join-room";
      socket.emit(eventString, data);
      localStorage.setItem("username", username);
      router.push(`/${roomToJoin}`);
    }
  };

  return (
    <div className="bg-[#34373d] h-screen flex justify-center items-center">
      <div className="bg-[#fafcff] borded rounded-md w-[300px] h-fit p-2 flex flex-col gap-[5px]">
        <span className="text-xl">Username:</span>
        <input
          onChange={(e) => setUsername(e.target.value)}
          className="border rounded-md border-black p-2 text-lg"
        />
        {creatingRoom ? (
          <>
            <span className="text-xl">Room:</span>
            <input
              onChange={(e) => setRoomID(e.target.value)}
              className="border rounded-md border-black p-2 text-lg"
            />
          </>
        ) : (
          <>
            <span className="text-xl">Select a room:</span>
            <div className="thin-blue-scrollbar border rounded-md border-black h-[200px] overflow-y-scroll">
              {existingRooms.map((room: string, idx: Number) => {
                const isSelected = room === selectedRoomID;
                return (
                  <div
                    key={room + String(idx)} // Always use a key when mapping over an array for React elements
                    className={`bg-white ${
                      isSelected ? "bg-blue-500" : ""
                    } p-2 cursor-pointer`}
                    onClick={() => {
                      setSelectedRoomID(room);
                    }} // Assuming you have a method to update the selectedRoom
                  >
                    {room}{" "}
                  </div>
                );
              })}
            </div>
          </>
        )}
        <span className="text-sm text-red-500">{error}</span>
        <button
          className="bg-[#4a8ff7] border rounded-md border-black text-white p-2"
          onClick={(e) => setCreatingRoom((prevState) => !prevState)}
        >
          {creatingRoom ? "Join Existing Room" : "Create Another Room"}
        </button>
        <button
          className="bg-[#4a8ff7] border rounded-md border-black text-white p-2"
          onClick={handleJoinRoom}
        >
          Go To Room
        </button>
      </div>
    </div>
  );
};

export default Home;
