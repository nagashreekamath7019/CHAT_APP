import express from "express";
import dotenv from "dotenv";
import dbConnect from "./DB/dbConnect.js";
import authRouter from "./rout/authUser.js";
import messageRouter from "./rout/messageRout.js";
import userRouter from "./rout/userRout.js";
import cookieParser from "cookie-parser";
import path from "path";
import { app, server } from './Socket/socket.js';
import cors from 'cors';

dotenv.config();

// Allowed origins list
const allowedOrigins = [
  "https://chatternode.onrender.com",
  "https://chatternode.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman or mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// API Routes
app.use(`/api/auth`, authRouter);
app.use(`/api/message`, messageRouter);
app.use(`/api/user`, userRouter);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  dbConnect();
  console.log(`Working at ${PORT}`);
});