const router = require("express").Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

router.get(
  "/getUserByEmail",
  authController.protect,
  userController.getUserByEmail
);

router.post("/login", authController.notLoggedIn, authController.login);
router.post("/logout", authController.protect, authController.logout);
router.post("/signup", authController.notLoggedIn, authController.signup);
router.get("/currentUser", authController.protect, userController.currentUser);
router.post(
  "/forgotpassword",
  authController.notLoggedIn,
  authController.forgotPassword
);
router.post(
  "/resetpassword/:token",
  authController.notLoggedIn,
  authController.resetPassword
);
router.post(
  "/changepassword",
  authController.protect,
  authController.changeUserPassword
);
//address crud
router

//example of admin route:
router.get(
  "/admin",
  authController.protect,
  authController.restrictTo("admin"),
  userController.admin
);

module.exports = router;
