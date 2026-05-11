import express from "express";
import isLogin from "../middleware/isLogin.js";
import { getCurrentChatters, getUserBySearch } from "../routControlers/userhandlerControler.js";
import { updateUsername , updateFullname, updateGender } from "../routControlers/userroutControler.js";


const router = express.Router();

router.get('/search', isLogin, getUserBySearch);

router.get('/currentchatters',isLogin,getCurrentChatters)

router.post("/update-username", updateUsername);

router.post("/update-fullname", updateFullname);

router.post("/update-gender", updateGender);

export default router;