import { Router } from "express";
import { prisma } from "../index";
import auth from "./verifyToken";
const router = Router();

router.post("/subscribe", auth, async (req: any, res) => {
  console.log("route for subscribe");
  if (!req.body.fcmtoken) {
    return res.status(404).json({ msg: "no fcmtoken provided" });
  }

  const userId = req.userData.userId;
  const fcmtoken = req.body.fcmtoken;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (user) {
      //if fcm token exist and need to update
      if (!(user.fcmtoken && user.fcmtoken === fcmtoken)) {
        await updateFcmToken(userId, fcmtoken);
        return res.status(200).json({ msg: "fcmtoken updated" });
      } else {
        //if fcmtoken exist no need to update
        return res.status(200).json({ msg: "same fcmtoken already exist" });
      }
    } else {
      return res.status(404).json({ msg: "user does not exist" });
    }
  } catch (error) {
    return res.status(500).json({ msg: "server failure" });
  }
});

export default router;

const updateFcmToken = async (userId: number, fcmtoken: string) => {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        fcmtoken: fcmtoken,
      },
    });
    console.log(user);
  } catch (error) {
    throw error;
  }
};
