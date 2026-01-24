import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import router from "./Routes/route.js";

const app = express();

const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5173",
  "https://riko-ai-d2cj.vercel.app",
  "https://riko-ai-delta.vercel.app",
  "https://thbstage.thinkbar.in",
  "https://thinkbar.in",
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) cb(null, true);
      else cb(new Error("CORS blocked"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.json({ status: "success", message: "Server running" });
});

app.use("/", router);

export default app;
