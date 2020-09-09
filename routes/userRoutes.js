const router = require("express").Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

router.get(
  "/getUserByEmail",
  authController.protect,
  userController.getUserByEmail
);
router.get("/login", authController.login);
router.post("/logout", authController.protect, authController.logout);
router.post("/signup", authController.signup);
router.get("/currentUser", authController.protect, userController.currentUser);
router.get(
  "/admin",
  authController.protect,
  authController.restrictTo("admin"),
  userController.admin
);
module.exports = router;
