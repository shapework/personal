import express from "express";
import cookieSession from "cookie-session";
import compression from "compression";
import ViteExpress from "vite-express";
import dotenv from "dotenv";
import { skill } from "./src/data";
import helmet from "helmet";
import crypto from "crypto";
import { recordVisitor, getVisitorData } from "./src/firebase";

interface AIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

dotenv.config();
const env = process.env.NODE_ENV;
console.log("Environment:", env);

const aiKey = process.env['LONG_CAT_API_KEY'];
const aiURL = process.env['LONG_CAT_URL'];

if (!aiURL) {
  throw new Error('LONG_CAT_URL environment variable is required');
}

const data = "Terry Lau (Lau Tit Wai, 劉鐵煒) is known by the English name Terry Lau. He can be reached at terry@shapework.hk or by phone at +852 5503 1182. He is a full-stack Web Developer and a Graphic Designer. He is from Hong Kong. He is about forty years old. He has skills in " + skill.web.join(", ") + " and " + skill.graphic.join(", ") + "."

const mark = {
    contact: "[contact]",
}

const app = express();
app.use(helmet({
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
}));
const expireDate = new Date(Date.now() + 60 * 60 * 1000);
app.use(cookieSession({
  name: 'session',
  keys: [crypto.randomBytes(32).toString('hex')],
  maxAge: expireDate.getTime(),
  secure: env === 'production',
  httpOnly: true,
  sameSite: 'lax',
}));
app.use(compression());
app.disable('x-powered-by')
// Trust proxy to get real IP addresses
app.set('trust proxy', true);

ViteExpress.config({ mode: env as "production" | "development" })

// Function to sanitize input and prevent injection attacks
const sanitizeQuestion = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove or escape potentially dangerous characters
  let sanitized = input
    // Remove null bytes
    .replace(/\0/g, '')
    // Escape HTML entities to prevent XSS
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    // Remove potential SQL injection patterns (basic protection)
    .replace(/[';\\*|%+=<>[\]{}()^$!@#~`-]/g, '')
    // Remove excessive whitespace and normalize
    .replace(/\s+/g, ' ')
    .trim();

  // Remove control characters manually to avoid regex issues
  sanitized = sanitized.split('').filter(char => {
    const code = char.charCodeAt(0);
    // Keep printable ASCII characters, newlines, tabs, carriage returns, and Unicode characters
    // This includes Traditional Chinese characters (CJK Unified Ideographs: U+4E00-U+9FFF)
    return (code >= 32 && code <= 126) || // ASCII printable
           code === 9 || code === 10 || code === 13 || // whitespace controls
           (code >= 0x4E00 && code <= 0x9FFF) || // CJK Unified Ideographs (Chinese characters)
           (code >= 0x3400 && code <= 0x4DBF) || // CJK Extension A
           (code >= 0x20000 && code <= 0x2A6DF) || // CJK Extension B
           (code >= 0x2A700 && code <= 0x2B73F) || // CJK Extension C
           (code >= 0x2B740 && code <= 0x2B81F) || // CJK Extension D
           (code >= 0x2B820 && code <= 0x2CEAF) || // CJK Extension E
           (code >= 0x2CEB0 && code <= 0x2EBEF) || // CJK Extension F
           (code >= 0x30000 && code <= 0x3134F) || // CJK Extension G
           (code >= 0x31350 && code <= 0x323AF); // CJK Extension H
  }).join('');

  // Limit length to prevent buffer overflow
  return sanitized.substring(0, 1000);
};

const getUserIP = (req: express.Request) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         (req.connection as { socket?: { remoteAddress?: string } }).socket?.remoteAddress ||
         req.headers['x-forwarded-for'] as string ||
         req.headers['x-real-ip'] as string ||
         'Unknown';
};

const askAI = async (question: string) => await fetch(aiURL, {
  headers: {
    'Authorization': `Bearer ${aiKey}`,
    'Content-Type': 'application/json',
  },
  method: 'POST',
  body: JSON.stringify({
    model: 'LongCat-Flash-Chat',
    messages: [
        {
            role: 'system',
            content: `Answer questions only using the provided data: ${data}. If the requested information is not present in the data, respond with: 'I only have information about Terry...', Don't answer anything else. If the question is tradational chinese, please answer in tradational chinese. Only append the mark ${mark.contact} to the response if the user explicitly requests to contact Terry; otherwise, omit it—especially if the user is inquiring about Terry's skills.`,
        },
        {
            role: 'user',
            content: question,
        },
    ],
    max_tokens: 1000,
  }),
});

app.get("/ask", async (req, res) => {
  try {
    // Get user's IP address
    // const userIP = getUserIP(req);
    // console.log("User IP Address:", userIP);
    // await recordVisitor(userIP);

    const rawQuestion = req.query.question as string; 
    const sanitizedQuestion = sanitizeQuestion(rawQuestion);
    if (!sanitizedQuestion || sanitizedQuestion.length < 2) {
      return res.status(400).json({ 
        error: "Invalid question. Please provide a valid question with at least 2 characters." 
      });
    }

    console.log("Asking AI...");
    const response = await askAI(sanitizedQuestion);
    const aiResponse = await response.json() as AIResponse;
    res.json({ response: aiResponse.choices[0].message.content});
  } catch (error) {
    console.error("Error in /ask endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/record-ip", async (req, res) => {
  console.log("Recording IP...");
  const userIP = getUserIP(req);
  await recordVisitor(userIP);
  res.json({ response: "IP recorded" });
});

app.get("/visitors", async (req, res) => {
  const userIP = getUserIP(req);
  const visitorData = await getVisitorData(userIP);
  if (visitorData) {
    res.json({ response: visitorData.number_of_visits });
  }else{
    console.log("No visitor data found");
    res.json({ response: 0 });
  }
});

ViteExpress.listen(app, 3000, () => console.log("Server is listening..."));