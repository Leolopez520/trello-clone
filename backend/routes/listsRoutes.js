const express = require("express");
const router = express.Router();

const listsController = require("../controllers/listsController");

router.post("/", listsController.createList);
router.put("/reorder", listsController.reorderLists);
router.put("/:id", listsController.updateTitleList);
router.get("/:boardId", listsController.getLists);
router.delete("/:id", listsController.deleteLists);

module.exports = router;
