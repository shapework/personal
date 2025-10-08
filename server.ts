import express from "express";
import ViteExpress from "vite-express";
import dotenv from "dotenv";
import { skill } from "./src/data";

dotenv.config();
const env = process.env.NODE_ENV;
console.log("Environment:", env);

const aiKey = process.env['LONG_CAT_API_KEY'];
const aiURL = process.env['LONG_CAT_URL'];

const data = "Terry Lau (Lau Tit Wai, 劉鐵煒) is known by the English name Terry Lau. He can be reached at terry@shapework.hk or by phone at +852 5503 1182. He is a full-stack Web Developer and a Graphic Designer. He is from Hong Kong. He is about forty years old. He has skills in " + skill.web.join(", ") + " and " + skill.graphic.join(", ") + "."

const mark = {
    contact: "[contact]",
}

const app = express();
ViteExpress.config({ mode: env as "production" | "development" })

if (!aiURL) {
  throw new Error('LONG_CAT_URL environment variable is required');
}

interface AIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

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
  console.log("Asking AI...");
  const question = req.query.question as string;
  const response = await askAI(question);
  const aiResponse = await response.json() as AIResponse;
//   console.log(aiResponse.choices[0].message.content);
  res.json({ response: aiResponse.choices[0].message.content});
});

ViteExpress.listen(app, 3000, () => console.log("Server is listening..."));