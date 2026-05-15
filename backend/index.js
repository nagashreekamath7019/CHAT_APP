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

// 2. Add this block BEFORE your routes
app.use(cors({
    origin: "https://chatternode.onrender.com",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json());
app.use(cookieParser());

// API Routes
app.use(`/api/auth`, authRouter);
app.use(`/api/message`, messageRouter);
app.use(`/api/user`, userRouter);
app.use(express.json({ limit: '1mb'}));
app.use(express.urlencoded({ extended: true, limit: "1mb"}));

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    dbConnect();
    console.log(`Working at ${PORT}`);
});