import { Router } from "express";
import {loginuser, logoutuser, registeruser,refreshaccesstokenn,changepassword,getcurrentuser} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyjwt } from "../middlewares/auth.middleware.js";

const router=Router()

router.route("/register").post(
    upload.fields([{name:"avtar",maxcount:1},{name:"coverimage",mxcount:1}]),
    registeruser)
router.route("/login").post(loginuser)
router.route("/logout").post(verifyjwt, logoutuser)
router.route("/refresh-token").post(refreshaccesstokenn)

export default router