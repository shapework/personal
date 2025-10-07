import { useState } from "react";
import { Info, Chat } from "./components/Sections";
import clsx from "clsx";

import "./App.css";
import info_bg from "../public/assets/bg_1_resize.jpg";
import chat_bg from "../public/assets/bg_chat_2.svg";

import { FaCircleInfo } from "react-icons/fa6";
import { RiChatSmileAiLine } from "react-icons/ri";

function App() {
  const [browsing, setBrowsing] = useState("Info");
  return (
    <div
      style={{
        backgroundImage: `url(${browsing === "Info" ? info_bg : chat_bg})`,
      }}
      className="w-full h-screen flex flex-col items-center justify-between py-12 bg-base-100 bg-cover bg-center"
    >
      <div
        className={clsx(
          "w-full h-full absolute top-0 left-0 transition-all duration-300",
          browsing === "Info" ? "bg-black/50" : "bg-white/85",
        )}
      ></div>
      {browsing === "Info" ? (
      <div
        className={clsx(
          "z-10 flex-col items-center w-full flex"
        )}
      >
        <Info />
      </div>
      ) : (
        <Chat />
      )}
      <label className="swap swap-flip text-6xl z-10">
        <input type="checkbox" />

        <div
          className="swap-on text-neutral-800 tooltip tooltip-open"
          data-tip="back to info"
          onClick={() => setBrowsing("Info")}
        >
          <FaCircleInfo />
        </div>
        <div
          className="swap-off text-white tooltip tooltip-open"
          data-tip="ask me a question"
          onClick={() => setBrowsing("Chat")}
        >
          <RiChatSmileAiLine />
        </div>
      </label>
    </div>
  );
}

export default App;
