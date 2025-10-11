import { useState } from "react";
import { Info, Chat } from "./components/Sections";
import { OptimizedBackground } from "./components/OptimizedBackground";
import clsx from "clsx";

import "./App.css";

import { FaCircleInfo } from "react-icons/fa6";
import { RiChatSmileAiLine } from "react-icons/ri";

function App() {
  const [browsing, setBrowsing] = useState("Info");

  const handleRecordIP = () => {
    fetch("/record-ip");
  };

  return (
    <OptimizedBackground browsing={browsing}>
      <div
        className={clsx(
          "w-full h-full absolute top-0 left-0 transition-all duration-300",
          browsing === "Info" ? "bg-black/50" : "bg-white/85",
        )}
      ></div>
      <div className="w-full flex flex-col items-center justify-center">
      <label className="swap swap-flip text-6xl z-10 grid md:hidden my-12">
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
          data-tip="ask me questions"
          onClick={() => {
            setBrowsing("Chat");
            handleRecordIP();
          }}
        >
          <RiChatSmileAiLine />
        </div>
      </label>
      {browsing === "Info" ? (
        <div className={clsx("z-10 flex-col items-center w-full flex relative")}>
          <Info />
        </div>
      ) : (
        <Chat />
      )}
      </div>
      <label className="swap swap-flip text-6xl z-10 hidden md:grid">
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
          data-tip="ask me questions"
          onClick={() => {
            setBrowsing("Chat");
            handleRecordIP();
          }}
        >
          <RiChatSmileAiLine />
        </div>
      </label>
    </OptimizedBackground>
  );
}

export default App;
