import express from "express";
import { secrets } from "./Secrets.js";
import cors from "cors";
import bodyParser from "body-parser";
import router from "./Routes/route.js";

const port = secrets.port;
const app = express();

// Enable CORS with specific domains
const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5173",
  "https://riko-ai-d2cj.vercel.app",
  "https://riko-ai-delta.vercel.app",
  "https://riko-ai-d2cj.vercel.app/", // Add with trailing slash
  "https://riko-ai.vercel.app", // If you have this domain
  "https://thbstage.thinkbar.in", // Add your thinkbar domain if needed
  "http://localhost:3000",
  "http://localhost:8080"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

// Handle preflight requests
app.options("*", cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Server is running",
  });
});

app.use("/", router);

app.listen(port || 3000, () => {
  console.log(`Server is running on port ${port}`);
});