import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

function auth(req: any, res: Response, next: NextFunction) {
  const token = req.header("auth-token");
  if (!token) return res.status(404).end("access denied");

  try {
    const verified = verify(token, process.env.TOKEN_SECRET!);
    req.userData = verified;
    req.userData["auth-token"] = token;
    next();
  } catch (error) {
    res.status(400).send("Invalid token");
  }
}

export default auth;
