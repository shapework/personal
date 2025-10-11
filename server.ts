import ViteExpress from "vite-express";
import app from "./src/app";

const env = process.env.NODE_ENV;
console.log("Environment:", env);

ViteExpress.config({ mode: env as "production" | "development" });

ViteExpress.listen(app, 3000, () => console.log("Server is listening..."));
