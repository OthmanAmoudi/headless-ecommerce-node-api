const router = require("express").Router();
const reviewController = require("../controllers/reviewController");
const auth = require("../controllers/authController");

router.post("/", auth.protect, reviewController.createReview);
router.get("/:id", reviewController.getReview);

module.exports = router;
