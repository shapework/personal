import { motion, AnimatePresence } from "motion/react";
import { useMemo, useState, useRef } from "react";
import { ContentCard } from "./Cards";
import { skill, about, projects } from "../data";
import Typewriter from 'typewriter-effect';

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
      headerBgColor: "bg-secondary",
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

  const positions = [
    {
      top: "10%",
      left: "30%",
    },
    {
      top: "10%",
      left: "50%",
    },
    {
      top: "40%",
      left: "30%",
    },
    {
      top: "40%",
      left: "50%",
    },
  ];

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
              typewriter.typeString("I'm a full-stack Web Developer...").pauseFor(2000).deleteAll(1).typeString("and a Graphic Designer.").start();
            }}
            options={{
              delay: 25,
              cursor: "<",
              cursorClassName: "text-warning",
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
            scale: Math.random() * 0.4 + 0.6,
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
  return (
    <div className="md:w-2/3 w-5/6 relative h-screen flex flex-col items-center justify-between gap-12">
      <h1 className="text-5xl text-neutral-800 caveat-semibold flex flex-col items-center gap-4">
      <Typewriter
            onInit={(typewriter) => {
              typewriter.typeString("I am an \"one question AI\" of this guy.").pauseFor(1500).start();
            }}
            options={{
              delay: 25,
              deleteSpeed: 1,
              cursor: "",
            }}
          />
          <small className="text-neutral-500 caveat-regular">
          <Typewriter
            onInit={(typewriter) => {
              typewriter.pauseFor(2500).typeString("and I don't know anything beyond that....").start();
            }}
            options={{
              delay: 25,
              deleteSpeed: 1,
              cursor: "",
            }}
          />
          </small>
        </h1>
        <div className="flex flex-col items-center gap-4 md:w-2/3 w-full mb-16">
        <textarea 
        className="textarea textarea-bordered w-full h-48 focus:outline-none border-none text-center resize-none md:h-96 h-60" 
        placeholder="Ask me a question"
        maxLength={300}
        ></textarea>
        <button className="btn btn-soft btn-secondary btn-wide">Send</button>
        </div>
    </div>
  );
};

export { Info, Chat };
