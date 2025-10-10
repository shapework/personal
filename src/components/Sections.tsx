import { useMemo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ContentCard } from "./Cards";
import { skill, about, projects } from "../data";
import Typewriter from "typewriter-effect";
import clsx from "clsx";
import { ProjectCard, type Project } from "./Cards";
import { contactSchema } from "../validation";

import { FaCode } from "react-icons/fa6";
import { RiLayoutMasonryFill } from "react-icons/ri";
import { IoFingerPrint } from "react-icons/io5";
// import { SiNounproject } from "react-icons/si";

const WebCard = ({ projects }: { projects: Project[] }) => {
  return (
    <div className="flex flex-col gap-4">
      {projects.map((project) =>
        project.type === "web" ? (
          <ProjectCard key={project.name} project={project} />
        ) : null,
      )}
    </div>
  );
};

const GraphicCard = ({ projects }: { projects: Project[] }) => {
  return (
    <div className="flex gap-4 md:flex-row flex-col">
      {projects.map((project) =>
        project.type === "graphic" ? (
          <ProjectCard key={project.name} project={project} />
        ) : null,
      )}
    </div>
  );
};

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
      reference: <WebCard projects={projects} />,
    },
    {
      rotation: Math.random() * -25,
      icon: <RiLayoutMasonryFill />,
      headerBgColor: "bg-warning",
      title: "Graphic",
      description: skill.graphic.join(", "),
      reference: <GraphicCard projects={projects} />,
    },
    {
      rotation: Math.random() * -25,
      icon: <IoFingerPrint />,
      headerBgColor: "bg-info",
      title: "About",
      description: about.name + " / " + about.email + " / " + about.phone,
    },
    // {
    //   rotation: Math.random() * 25,
    //   icon: <SiNounproject size={50} />,
    //   headerBgColor: "bg-success",
    //   title: "Projects",
    //   description: <ProjectCards projects={projects} />,
    // },
  ];

  // Generate non-overlapping random positions within the visible area
  const positions = useMemo(() => {
    const maxTopPercent = 150; // keep inside container
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
      const ok = generated.every(
        (p) => distance(p, candidate) >= minDistancePercent,
      );
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
        const top =
          rows > 1 ? row * (maxTopPercent / (rows - 1)) : maxTopPercent / 2;
        const left = col * maxLeftPercent;
        generated.push({ top, left });
      }
    }

    return generated.map((p) => ({ top: `${p.top}%`, left: `${p.left}%` }));
  }, [cards.length]);

  const mobilePositions = [
    {
      top: "0%",
      left: "20%",
    },

    {
      top: "40%",
      left: "20%",
    },
    {
      top: "80%",
      left: "20%",
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
        I'm a full-stack Web Developer and Graphic Designer.
        {/* <Typewriter
            onInit={(typewriter) => {
              typewriter.pauseFor(1000).typeString("I'm a full-stack Web Developer...").pauseFor(2000).deleteAll(1).typeString("and a Graphic Designer.").start();
            }}
            options={{
              delay: 40,
              cursor: "<",
              cursorClassName: "text-warning animate-pulse",
            }}
          /> */}
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
              onClose={() => setSelectedIndex(null)}
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
                  className="card flex flex-col items-center"
                  onClick={(e) => {
                    // Prevent closing when clicking inside the card content
                    e.stopPropagation();
                  }}
                >
                  <ContentCard
                    title={cards[selectedIndex].title}
                    description={cards[selectedIndex].description as string}
                    icon={cards[selectedIndex].icon}
                    headerBgColor={cards[selectedIndex].headerBgColor}
                    isPopover={true}
                    reverse={cards[selectedIndex].reverse}
                    onClick={() => setSelectedIndex(selectedIndex)}
                    onClose={() => setSelectedIndex(null)}
                    reference={cards[selectedIndex].reference}
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
  const [questionCount, setQuestionCount] = useState(0);
  const [questionHistory, setQuestionHistory] = useState<string[]>([]);
  const [response, setResponse] = useState<string[]>([]);
  const [hasNewResponse, setHasNewResponse] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [visitors, setVisitors] = useState({
    haveVisited: false,
    number_of_visits: 0,
  });
  // const [needContact, setNeedContact] = useState(false);

  const handleSend = () => {
    setIsLoading(true);
    setQuestionHistory([...questionHistory, question]);
    fetch(`/ask?question=${question}`)
      .then((res) => res.json())
      .then((data) => setResponse([...response, data.response]));
  };

  const handleGetVisitors = () => {
    fetch("/visitors")
      .then((res) => res.json())
      .then((data) => {
        setVisitors({
          haveVisited: data.response > 0,
          number_of_visits: data.response,
        });
        console.log("Number of visits: ", data.response);
        console.log("Have visited: ", data.response > 0);
      });
  };

  useEffect(() => {
    if (response.length > 0) {
      setHasNewResponse(true);
      setIsLoading(false);
      const lastResponse = response[response.length - 1];
      const contact = lastResponse.includes("[contact]");
      if (contact) {
        // setNeedContact(true);
        // alert("Include contact method");
        setResponse([...response.slice(0, -1), lastResponse.replace("[contact]", "")]);
      }
    }
  }, [response]);

  useEffect(() => {
    handleGetVisitors();
  }, []);

  return (
    visitors.number_of_visits > 3 ? <Contact />
      : 
      <div className="md:w-2/3 w-5/6 relative h-screen flex flex-col items-center justify-evenly gap-12">
      {!visitors.haveVisited && (
        <h1 className="text-5xl text-neutral-800 caveat-semibold flex flex-col items-center gap-4">
          <Typewriter
            onInit={(typewriter) => {
              typewriter
                .pauseFor(300)
                .typeString("Hello, You can ask me about Terry")
                .pauseFor(1500)
                .start();
            }}
            options={{
              delay: 40,
              deleteSpeed: 1,
              cursor: "",
            }}
          />
        </h1>
      )}

      {visitors.haveVisited &&
        visitors.number_of_visits >= 1 && visitors.number_of_visits <= 2 && (
          <h1 className="text-5xl text-neutral-800 caveat-semibold flex flex-col items-center gap-4">
            <Typewriter
              onInit={(typewriter) => {
                typewriter
                  .pauseFor(300)
                  .typeString("I think we may have met before....")
                  .pauseFor(1500)
                  .start();
              }}
              options={{
                delay: 40,
                deleteSpeed: 1,
                cursor: "",
              }}
            />
          </h1>
        )}

      {visitors.haveVisited && visitors.number_of_visits === 3 && (
        <h1 className="text-5xl text-neutral-800 caveat-semibold flex flex-col items-center gap-4">
          <Typewriter
            onInit={(typewriter) => {
              typewriter
                .pauseFor(300)
                .typeString("I’ve noticed you, you should reach out to Terry.")
                .pauseFor(1500)
                .start();
            }}
            options={{
              delay: 40,
              deleteSpeed: 1,
              cursor: "",
            }}
          />
        </h1>
      )}
      <div className="flex flex-col items-center gap-8 md:w-2/3 w-full mb-16 relative">
        <div className="w-full">
          {questionHistory.map((question, index) => (
            <div className="flex flex-col gap-2 justify-between items-between" key={`conversation-${index}`}>
              <div className="chat chat-start md:w-1/3 w-full self-start">
                <div className="chat-bubble text-sm">{question}</div>
              </div>
              {response[index] && (
                <div className="chat chat-end md:w-2/3 w-full self-end">
                  <div className="chat-bubble text-sm">
                    {index === response.length - 1 && hasNewResponse ? (
                      <Typewriter
                        onInit={(typewriter) => {
                          typewriter
                            .pauseFor(1000)
                            .typeString(response[index])
                            .pauseFor(1500)
                            .callFunction(() => {
                              setHasNewResponse(false);
                            })
                            .start();
                        }}
                        options={{
                          delay: 5,
                          deleteSpeed: 1,
                          cursor: "",
                        }}
                      />
                    ) : (
                      response[index]
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center gap-2 w-full">
          <textarea
            className="textarea w-full focus:outline-none min-h-36 text-center resize-none bg-white p-4"
            placeholder="Ask me questions"
            maxLength={300}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading || questionCount > 1}
          ></textarea>
          <button
            className={clsx(
              "btn btn-wide",
              isLoading ||
                question.length === 0 ||
                (questionCount > 3 && "cursor-not-allowed"),
              question.length === 0 ? "" : "btn-warning",
            )}
            onClick={() => {
              handleSend();
              setQuestionCount(questionCount + 1);
            }}
            disabled={isLoading || question.length === 0 || questionCount > 1}
          >
            {isLoading && <span className="loading loading-spinner"></span>}
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

const Contact = () => {
  const [errors, setErrors] = useState<{ name: string, email: string, message: string }>({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<string>("");
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResponse("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;
    const name_validation = contactSchema.shape.name.safeParse(name);
    const email_validation = contactSchema.shape.email.safeParse(email);
    const message_validation = contactSchema.shape.message.safeParse(message);
    if (!name_validation.success) {
      setErrors({ ...errors, name: name_validation.error.issues[0]?.message ?? "Invalid name" });
      setIsSubmitting(false);
      return;
    }

    if (!email_validation.success) {
      setErrors({ ...errors, email: email_validation.error.issues[0]?.message ?? "Invalid email" });
      setIsSubmitting(false);
      return;
    }

    if (!message_validation.success) {
      setErrors({ ...errors, message: message_validation.error.issues[0]?.message ?? "Invalid message" });
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(true);
    fetch("/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, message }),
    })
      .then((res) => res.json())
      .then((data) => setResponse(data.response))
      .catch(() => setResponse("Something went wrong. Please try again."));
    // console.log(name, email, message);
  };
   useEffect(() => {
    if (response.length > 0) {
      setIsSubmitting(false);
    }
   }, [response]);
  return (
    <div className="md:w-2/3 w-full relative h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-5xl text-neutral-800 caveat-semibold flex flex-col items-center gap-4 w-full">
      <Typewriter
            onInit={(typewriter) => {
              typewriter
                .pauseFor(300)
                .typeString("Get in touch")
                .pauseFor(1500)
                .start();
            }}
            options={{
              delay: 40,
              deleteSpeed: 1,
              cursor: "",
            }}
          />
      </h1>
      <div className="flex flex-col items-center gap-4 md:w-1/2 w-5/6">
        <form className="w-full flex flex-col items-center gap-4" onSubmit={handleSubmit}>
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4">
            <legend className="fieldset-legend text-lg lexend-deca-bold">Contact details</legend>

            <div className="w-full flex items-center gap-2 justify-between"><label className="label lexend-deca-bold">Title</label><span className="text-red-500 text-sm">{errors.name}</span></div>
            <input type="text" className="input w-full focus:outline-none" placeholder="Name" name="name"
            onBlur={(e) => {
              if (e.target.value.length > 0) {
                setErrors({ ...errors, name: "" });
              }
            }}
            />

            <div className="w-full flex items-center gap-2 justify-between"><label className="label lexend-deca-bold">Email</label><span className="text-red-500 text-sm">{errors.email}</span></div>
            <input type="text" className="input w-full focus:outline-none" placeholder="Email" name="email"
            onBlur={(e) => {
              if (e.target.value.length > 0) {
                setErrors({ ...errors, email: "" });
              }
            }}
            />

            <div className="w-full flex items-center gap-2 justify-between"><label className="label lexend-deca-bold">Message</label><span className="text-red-500 text-sm">{errors.message}</span></div>
            <textarea className="textarea w-full focus:outline-none resize-none" placeholder="Message" minLength={10} name="message"
            onBlur={(e) => {
              if (e.target.value.length > 10 ) {
                setErrors({ ...errors, message: "" });
              }
            }}
            ></textarea>
          </fieldset>
          <p className="text-red-500 text-sm">{response}</p>
          <button className="btn btn-primary btn-wide" type="submit">{isSubmitting && <span className="loading loading-spinner"></span>} Submit</button>
        </form>
        
      </div>
    </div>
  );
};

export { Info, Chat, Contact };
