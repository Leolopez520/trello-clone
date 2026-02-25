const express = require("express");
const router = express.Router();

const boardsController = require("../controllers/boardsController");

router.post("/", boardsController.createBoard);
router.get("/", boardsController.getBoards);
router.delete("/:id", boardsController.deleteBoard);
router.put("/:id", boardsController.updateBoard);
router.get("/:id", boardsController.getBoard);

module.exports = router;
