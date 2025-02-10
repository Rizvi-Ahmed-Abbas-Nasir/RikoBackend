import express from "express";
import { secrets } from "./Secrets.js";
import cors from "cors";
import bodyParser from "body-parser";

import router from "./Routes/route.js";

const port = secrets.port;
const app = express();

// Enable CORS with specific domains
app.use(
  cors({
    origin: [
      
      "http://127.0.0.1:5500",
      "http://localhost:5173",
      "https://riko-ai-delta.vercel.app/"
      
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

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
