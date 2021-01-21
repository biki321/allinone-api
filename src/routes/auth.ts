import { Router } from "express";
import { genSalt, hash, compare } from "bcryptjs";
import { prisma } from "../index";
import { sign } from "jsonwebtoken";
import auth from "./verifyToken";

const router = Router();

router.post("/signup", async (req, res) => {
  console.log("singup");
  const password: string = req.body.password;
  const email: string = req.body.email;

  //validation part
  if (!(password.length >= 6 && password.length <= 16)) {
    return res.status(404).json({ msg: "not a valid password" });
  } else if (await isEmailExist(email)) {
    console.log("email exist");
    return res.status(404).json({ msg: "email already exist" });
  }

  const salt: string = await genSalt(10);
  //encrypt password
  const hassedPass: string = await hash(password, salt);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        email: email,
        password: hassedPass,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "something went wrong" });
  }
  //create jwt
  const token: string = sign({ userId: user.id }, process.env.TOKEN_SECRET!);
  res.set("auth-token", token);
  res.status(200).json({
    email: email,
    userId: user.id,
    "auth-token": token,
  });
});

router.post("/login", async (req, res) => {
  console.log("login");
  const password: string = req.body.password;
  const email: string = req.body.email;

  let result = await isEmailExist(email);

  if (!result) {
    console.log("email does not exist");
    return res.status(404).json({ msg: "email does not exist" });
  }

  const validPass: boolean = await compare(password, result.password);
  if (!validPass) return res.status(404).json({ msg: "invalid password" });

  //create jwt
  const token: string = sign({ userId: result.id }, process.env.TOKEN_SECRET!);
  res.set("auth-token", token);
  res.status(200).json({
    email: email,
    userId: result.id,
    "auth-token": token,
  });
});

router.get("/currentuser", auth, async (req: any, res) => {
  console.log("route for link to get user");
  const userId = req.userData.userId;
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (user === null) {
    return res.status(404).json({ msg: "usr does not exist" });
  }
  res.status(200).json({
    email: user?.email,
    userId: user?.id,
    "auth-token": req.userData["auth-token"],
  });
});

async function isEmailExist(email: string) {
  const result = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (result === null) {
    return false;
  } else {
    return result;
  }
}

export default router;
