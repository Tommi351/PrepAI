import express from "express";
const router = express.Router();
router.get("/", (req, res) => {
    res.send("Hello World, I am fine");
});
export default router;
//# sourceMappingURL=helloWorld.js.map