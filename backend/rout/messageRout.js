import express from "express"
import { deleteMultipleMessages, getMessages, sendMessage } from "../routControlers/messageroutControler.js";
import isLogin from "../middleware/isLogin.js";

const router = express.Router();

router.post("/send/:id", isLogin, sendMessage);

router.get("/:id", isLogin, getMessages);


router.delete("/delete-bulk", deleteMultipleMessages)

export default router;