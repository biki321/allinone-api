import express from "express";
import bodyParser from "body-parser";
import { PrismaClient } from "@prisma/client";
import authRouter from "./routes/auth";
import workRouter from "./routes/work";
import dotenv from "dotenv";
import cors from "cors";
import notificationRouter from "./routes/notification";
import admin from "firebase-admin";
import scheduleStart from "./helpers/scheduler";

dotenv.config();

const serviceAccount = require("./serviceAccountKey.json");
// const pvk = process.env.PRIVATE_KEY!.replace(/\\n/g, "\n");
// admin.initializeApp({
//   credential: admin.credential.cert({
//     projectId: process.env.PROJECT_ID,
//     clientEmail: process.env.CLIENT_EMAIL,
//     privateKey: pvk,
//   }),
// });

// console.log(process.env.PRIVATE_KEY!);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app: express.Application = express();
const port: string = process.env.PORT || "8032";

const prisma = new PrismaClient();

app.use(cors());

//middlewares
// parse application/json
app.use(bodyParser.json());

app.get("/", function (req, res) {
  res.send("Hello World!");
});

//authentication related
app.use("/api/user", authRouter);

//functions of the app
app.use("/api", workRouter);

//route for notification subscribe
app.use("/api", notificationRouter);

scheduleStart();

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

export { prisma, admin };
