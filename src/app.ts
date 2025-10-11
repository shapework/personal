import express from "express";
import cookieSession from "cookie-session";
import compression from "compression";
import { dontKnow, skill } from "./data";
import helmet from "helmet";
import crypto from "crypto";
import { recordVisitor, getVisitorData } from "./firebase";
import { contactSchema } from "./validation";
import { sendMail } from "./send-mail";

interface AIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const env = process.env.NODE_ENV;

const aiKey = process.env.VITE_LONG_CAT_API_KEY;
const aiURL = process.env.VITE_LONG_CAT_URL;

if (!aiURL) {
  throw new Error("LONG_CAT_URL environment variable is required");
}

const data =
  "Terry Lau (Lau Tit Wai, 劉鐵煒) is known by the English name Terry Lau. He can be reached at terry@shapework.hk or by phone at +852 5503 1182. He is a full-stack Web Developer and a Graphic Designer. He is from Hong Kong. He is about forty years old. He has skills in " +
  skill.web.join(", ") +
  " and " +
  skill.graphic.join(", ") +
  "." + dontKnow.join(". ") + ".";

const systemPrompt = `Answer questions only using the provided data: ${data}. If the requested information is not present in the data, respond with: 'I only have information about Terry...', DON'T ANSWER ANYTHING ELSE. If the question is English, MUST answer in English. If the question is Traditional Chinese, MUST answer in Traditional Chinese.`

const app = express();

// Middleware configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
      },
    },
  }),
);

const expireDate = new Date(Date.now() + 60 * 60 * 1000);
app.use(
  cookieSession({
    name: "session",
    keys: [crypto.randomBytes(32).toString("hex")],
    maxAge: expireDate.getTime(),
    secure: env === "production",
    httpOnly: true,
    sameSite: "lax",
  }),
);

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable("x-powered-by");
// Trust proxy to get real IP addresses
app.set("trust proxy", true);

// Function to sanitize input and prevent injection attacks
const sanitizeQuestion = (input: string): string => {
  if (!input || typeof input !== "string") {
    return "";
  }

  // Remove or escape potentially dangerous characters
  let sanitized = input
    // Remove null bytes
    .replace(/\0/g, "")
    // Escape HTML entities to prevent XSS
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    // Remove potential SQL injection patterns (basic protection)
    .replace(/[';\\*|%+=<>[\]{}()^$!@#~`-]/g, "")
    // Remove excessive whitespace and normalize
    .replace(/\s+/g, " ")
    .trim();

  // Remove control characters manually to avoid regex issues
  sanitized = sanitized
    .split("")
    .filter((char) => {
      const code = char.charCodeAt(0);
      // Keep printable ASCII characters, newlines, tabs, carriage returns, and Unicode characters
      // This includes Traditional Chinese characters (CJK Unified Ideographs: U+4E00-U+9FFF)
      return (
        (code >= 32 && code <= 126) || // ASCII printable
        code === 9 ||
        code === 10 ||
        code === 13 || // whitespace controls
        (code >= 0x4e00 && code <= 0x9fff) || // CJK Unified Ideographs (Chinese characters)
        (code >= 0x3400 && code <= 0x4dbf) || // CJK Extension A
        (code >= 0x20000 && code <= 0x2a6df) || // CJK Extension B
        (code >= 0x2a700 && code <= 0x2b73f) || // CJK Extension C
        (code >= 0x2b740 && code <= 0x2b81f) || // CJK Extension D
        (code >= 0x2b820 && code <= 0x2ceaf) || // CJK Extension E
        (code >= 0x2ceb0 && code <= 0x2ebef) || // CJK Extension F
        (code >= 0x30000 && code <= 0x3134f) || // CJK Extension G
        (code >= 0x31350 && code <= 0x323af)
      ); // CJK Extension H
    })
    .join("");

  // Limit length to prevent buffer overflow
  return sanitized.substring(0, 1000);
};

const getUserIP = (req: express.Request) => {
  return (
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection as { socket?: { remoteAddress?: string } }).socket
      ?.remoteAddress ||
    (req.headers["x-forwarded-for"] as string) ||
    (req.headers["x-real-ip"] as string) ||
    "Unknown"
  );
};

const askAI = async (question: string) =>
  await fetch(aiURL, {
    headers: {
      Authorization: `Bearer ${aiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      model: "LongCat-Flash-Chat",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: question,
        },
      ],
      max_tokens: 1000,
    }),
  });

// API Routes
// Handle both /ask and /api/ask for local development and production
app.get("/ask", async (req, res) => {
  try {
    const rawQuestion = req.query.question as string;
    const sanitizedQuestion = sanitizeQuestion(rawQuestion);
    if (!sanitizedQuestion || sanitizedQuestion.length < 2) {
      return res.status(400).json({
        error:
          "Invalid question. Please provide a valid question with at least 2 characters.",
      });
    }

    const response = await askAI(sanitizedQuestion);
    const aiResponse = (await response.json()) as AIResponse;
    res.json({ response: aiResponse.choices[0].message.content });
  } catch (error) {
    console.error("Error in /ask endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/record-ip", async (req, res) => {
  const userIP = getUserIP(req);
  await recordVisitor(userIP);
  res.json({ response: "IP recorded" });
});

app.get("/visitors", async (req, res) => {
  const userIP = getUserIP(req);
  const visitorData = await getVisitorData(userIP);
  if (visitorData) {
    res.json({ response: visitorData.number_of_visits });
  } else {
    console.log("No visitor data found");
    res.json({ response: 0 });
  }
});

app.post("/contact", async (req, res) => {
  try {
    const body = (req.body ?? {}) as Partial<{ name: string; email: string; message: string }>;
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message ?? "Invalid payload";
      return res.status(400).json({ response: firstIssue });
    }

    const { name, email, message } = parsed.data;
    const mailOptions = {
      to: "terry@shapework.hk",
      subject: "New Contact Form Submission",
      message: `<h1>New Contact Form Submission</h1><p>Name: ${name}</p><p>Email: ${email}</p><p>Message: ${message}</p>`,
    };
    await sendMail(mailOptions);
    return res.json({ response: "Email sent" });
  } catch (error) {
    console.error("Error in /contact endpoint:", error);
    return res.status(500).json({ response: "Internal server error" });
  }
});

// Production routes with /api prefix (for Netlify deployment)
app.get("/api/ask", async (req, res) => {
  try {
    const rawQuestion = req.query.question as string;
    const sanitizedQuestion = sanitizeQuestion(rawQuestion);
    if (!sanitizedQuestion || sanitizedQuestion.length < 2) {
      return res.status(400).json({
        error:
          "Invalid question. Please provide a valid question with at least 2 characters.",
      });
    }

    const response = await askAI(sanitizedQuestion);
    const aiResponse = (await response.json()) as AIResponse;
    res.json({ response: aiResponse.choices[0].message.content });
  } catch (error) {
    console.error("Error in /api/ask endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/record-ip", async (req, res) => {
  const userIP = getUserIP(req);
  await recordVisitor(userIP);
  res.json({ response: "IP recorded" });
});

app.get("/api/visitors", async (req, res) => {
  const userIP = getUserIP(req);
  const visitorData = await getVisitorData(userIP);
  if (visitorData) {
    res.json({ response: visitorData.number_of_visits });
  } else {
    console.log("No visitor data found");
    res.json({ response: 0 });
  }
});

app.post("/api/contact", async (req, res) => {
  try {
    const body = (req.body ?? {}) as Partial<{ name: string; email: string; message: string }>;
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message ?? "Invalid payload";
      return res.status(400).json({ response: firstIssue });
    }

    const { name, email, message } = parsed.data;
    const mailOptions = {
      to: "terry@shapework.hk",
      subject: "New Contact Form Submission",
      message: `<h1>New Contact Form Submission</h1><p>Name: ${name}</p><p>Email: ${email}</p><p>Message: ${message}</p>`,
    };
    await sendMail(mailOptions);
    return res.json({ response: "Email sent" });
  } catch (error) {
    console.error("Error in /api/contact endpoint:", error);
    return res.status(500).json({ response: "Internal server error" });
  }
});

export default app;
