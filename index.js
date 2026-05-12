import express from "express";
import dotenv from "dotenv";
import dbConnect from "./backend/DB/dbConnect.js";
import authRouter from "./backend/rout/authUser.js";
import messageRouter from "./backend/rout/messageRout.js";
import userRouter from "./backend/rout/userRout.js";
import cookieParser from "cookie-parser";
import path from "path";
import { app, server } from './backend/Socket/socket.js';


const __dirname = path.resolve();

dotenv.config();


app.use(express.json());
app.use(cookieParser())

app.use(`/api/auth`, authRouter)
app.use(`/api/message`, messageRouter);
app.use(`/api/user`, userRouter)

app.use(express.static(path.join(__dirname, "/frontend/dist")))

// Simplified catch-all for Koyeb to serve the frontend
app.get("/*path", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"))
})


const PORT = process.env.PORT || 8080

server.listen(PORT, () => {
    dbConnect();
    console.log(`Working at ${PORT}`);
})