import { Router } from "express";
import {loginuser, logoutuser, registeruser} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyjwt } from "../middlewares/auth.middleware.js";

const router=Router()

router.route("/register").post(
    upload.fields([{name:"avtar",maxcount:1},{name:"coverimage",mxcount:1}]),
    registeruser)
router.route("/login").post(loginuser)
router.route("/logout").post(verifyjwt, logoutuser)

export default router