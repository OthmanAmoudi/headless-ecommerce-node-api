const router = require("express").Router();
const productController = require("../controllers/productController");

router.post("/", productController.createProduct);
router.get("/:slug", productController.getProduct);
module.exports = router;
