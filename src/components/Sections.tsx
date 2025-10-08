import { useMemo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ContentCard } from "./Cards";
import { skill, about, projects } from "../data";
import Typewriter from 'typewriter-effect';
import clsx from "clsx";

import { FaCode } from "react-icons/fa6";
import { RiLayoutMasonryFill } from "react-icons/ri";
import { IoFingerPrint } from "react-icons/io5";
import { SiNounproject } from "react-icons/si";

const Info = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  // Define positions for each rectangle (based on visual estimation)
  const cards = [
    {
      rotation: Math.random() * 25,
      icon: <FaCode />,
      headerBgColor: "bg-base-100",
      reverse: true,
      title: "Web",
      description: skill.web.join(", "),
    },
    {
      rotation: Math.random() * -25,
      icon: <RiLayoutMasonryFill />,
      headerBgColor: "bg-warning",
      title: "Graphic",
      description: skill.graphic.join(", "),
    },
    {
      rotation: Math.random() * -25,
      icon: <IoFingerPrint />,
      headerBgColor: "bg-info",
      title: "About",
      description: about.name + " / " + about.email + " / " + about.phone,
    },
    {
      rotation: Math.random() * 25,
      icon: <SiNounproject size={50} />,
      headerBgColor: "bg-success",
      title: "Projects",
      description: projects.projects.map((project) => project.name).join(", "),
    },
  ];

  // Generate non-overlapping random positions within the visible area
  const positions = useMemo(() => {
    const maxTopPercent = 150;  // keep inside container
    const maxLeftPercent = 80; // keep inside container
    const minDistancePercent = 18; // minimum center-to-center distance to avoid overlap

    type Pos = { top: number; left: number };

    const distance = (a: Pos, b: Pos) => {
      const dx = a.left - b.left;
      const dy = a.top - b.top;
      return Math.hypot(dx, dy);
    };

    const generated: Pos[] = [];
    let attempts = 0;
    const maxAttempts = 1000;

    while (generated.length < cards.length && attempts < maxAttempts) {
      const candidate: Pos = {
        top: Math.random() * maxTopPercent,
        left: Math.random() * maxLeftPercent,
      };
      const ok = generated.every((p) => distance(p, candidate) >= minDistancePercent);
      if (ok) generated.push(candidate);
      attempts++;
    }

    // Fallback to a simple grid if random placement didn't finish in time
    if (generated.length < cards.length) {
      const remaining = cards.length - generated.length;
      const rows = Math.ceil((generated.length + remaining) / 2);
      for (let i = 0; i < remaining; i++) {
        const idx = generated.length + i;
        const row = Math.floor(idx / 2);
        const col = idx % 2;
        const top = rows > 1 ? (row * (maxTopPercent / (rows - 1))) : maxTopPercent / 2;
        const left = col * maxLeftPercent;
        generated.push({ top, left });
      }
    }

    return generated.map((p) => ({ top: `${p.top}%`, left: `${p.left}%` }));
  }, [cards.length]);

  const mobilePositions = [
    {
      top: "10%",
      left: "0%",
    },
    
    {
      top: "10%",
      left: "40%",
    },
    {
      top: "40%",
      left: "0%",
    },
    {
      top: "40%",
      left: "40%",
    },
  ];

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
  const currentPositions = isMobile ? mobilePositions : positions;

  const zIndexes = useMemo(
    () =>
      Array.from(
        { length: cards.length },
        () => Math.floor(Math.random() * 100) + 1,
      ),
    [cards.length],
  );

  return (
    <div className="flex flex-col items-center gap-12 md:w-2/3 w-full">
    <h1 className="text-2xl text-white nova-square-regular w-5/6 md:w-full flex justify-center h-36 md:h-0">
        <Typewriter
            onInit={(typewriter) => {
              typewriter.pauseFor(1000).typeString("I'm a full-stack Web Developer...").pauseFor(2000).deleteAll(1).typeString("and a Graphic Designer.").start();
            }}
            options={{
              delay: 40,
              cursor: "<",
              cursorClassName: "text-warning animate-pulse",
            }}
          />
        </h1>
    <div className="w-full relative h-96 flex-col items-center">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          layoutId={`card-${index}`}
          initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
          animate={{
            opacity: 1,
            scale: Math.random() * 1 + 0.6,
            rotate: card.rotation,
          }}
          transition={{
            delay: index * 0.1,
            duration: 0.2,
            ease: "easeOut",
          }}
          whileHover={{
            scale: 1.1,
            transition: { duration: 0.2, ease: "easeInOut" },
          }}
          whileTap={{
            scale: 0.95,
            transition: { duration: 0.1 },
          }}
          style={{
            top: currentPositions[index].top,
            left: currentPositions[index].left,
            // width: pos.width,
            // height: pos.height,
            position: "absolute",
            zIndex: zIndexes[index],
          }}
        >
          <ContentCard
            reverse={card.reverse}
            title={card.title}
            icon={card.icon}
            headerBgColor={card.headerBgColor}
            onClick={() => setSelectedIndex(index)}
          />
        </motion.div>
      ))}

      <AnimatePresence>
        {selectedIndex !== null && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIndex(null)}
              style={{ zIndex: 2000 }}
            />
            <motion.div
              ref={dragRef}
              key="modal"
              className="fixed inset-0 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ zIndex: 2001 }}
              onClick={() => setSelectedIndex(null)}
            >
              <motion.div
              drag
              dragMomentum={false}
              dragConstraints={dragRef}
                layoutId={`card-${selectedIndex}`}
                className="card max-w-full shadow-xl flex flex-col items-center"
                onClick={(e) => {
                  // Prevent closing when clicking inside the card content
                  e.stopPropagation();
                }}
              >
                <ContentCard
                  title={cards[selectedIndex].title}
                  description={cards[selectedIndex].description}
                  icon={cards[selectedIndex].icon}
                  headerBgColor={cards[selectedIndex].headerBgColor}
                  isPopover={true}
                  reverse={cards[selectedIndex].reverse}
                  onClick={() => setSelectedIndex(selectedIndex)}
                />
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  </div>
  );
};

const Chat = () => {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSend = () => {
    setIsLoading(true);
    setIsDone(false);
    fetch(`/ask?question=${question}`).then((res) => res.json()).then((data) => setResponse(data.response));
  }

  useEffect(() => {
    if (response) {
      setIsLoading(false);
      setIsDone(true);
      const contact = response.includes("[contact]");
      if (contact) {
        alert("Include contact method");
        setResponse(response.replace("[contact]", ""));
      }
    }
  }, [response]);

  return (
    <div className="md:w-2/3 w-5/6 relative h-screen flex flex-col items-center justify-evenly gap-12">
      <h1 className="text-5xl text-neutral-800 caveat-semibold flex flex-col items-center gap-4">
      <Typewriter
            onInit={(typewriter) => {
              typewriter.pauseFor(1000).typeString("I am \"one question AI\"").pauseFor(1500).start();
            }}
            options={{
              delay: 40,
              deleteSpeed: 1,
              cursor: "",
            }}
          />
          <small className="text-neutral-500 caveat-regular">
          <Typewriter
            onInit={(typewriter) => {
              typewriter.pauseFor(3000).typeString("You can ask me about Terry...").start();
            }}
            options={{
              delay: 25,
              deleteSpeed: 1,
              cursor: "",
            }}
          />
          </small>
        </h1>
        <div className="flex flex-col items-center gap-24 md:w-2/3 w-full mb-16 relative">
        <div className="flex flex-col items-center gap-8 w-full">
        <textarea 
        className="textarea w-full focus:outline-none min-h-24 text-center resize-none bg-white border-neutral-100 shadow-lg p-4" 
        placeholder="Ask me a question"
        maxLength={300}
        onChange={(e) => setQuestion(e.target.value)}
        disabled={isLoading || isDone}
        ></textarea>
        {response && <Typewriter
            onInit={(typewriter) => {
              typewriter.pauseFor(1000).typeString(response).pauseFor(1500).start();
            }}
            options={{
              delay: 5,
              deleteSpeed: 1,
              cursor: "",
            }}
          />}
        </div>
        <button 
        className={clsx("btn btn-wide", 
          isLoading || isDone || question.length === 0 && "cursor-not-allowed",
          question.length === 0 ? "" : "btn-warning",
        )} onClick={handleSend}
        disabled={isLoading || isDone || question.length === 0}
        >
          {isLoading && <span className="loading loading-spinner"></span>}
          Send
          </button>
        </div>
    </div>
  );
};

export { Info, Chat };
