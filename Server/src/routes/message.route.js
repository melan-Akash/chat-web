import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, editMessage, markMessagesAsSeen, deleteMessageForMe, deleteMessageForEveryone } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);
router.put("/edit/:id", protectRoute, editMessage);
router.put("/seen/:id", protectRoute, markMessagesAsSeen);
router.delete("/delete-for-me/:id", protectRoute, deleteMessageForMe);
router.delete("/delete-for-everyone/:id", protectRoute, deleteMessageForEveryone);

export default router;
