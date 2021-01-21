import { Router } from "express";
import { prisma } from "../index";
import auth from "./verifyToken";
import { URL } from "url";

const router = Router();

//return rows queried by column company
router.get("/links/:company", auth, async (req: any, res) => {
  console.log("route for link for comp");
  const userId = req.userData.userId;
  try {
    const result = await prisma.link.findMany({
      where: { userId: userId, company: req.params.company },
    });
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "something went wrong" });
  }
});

//return distinct values of column 'company'
router.get("/company", auth, async (req: any, res) => {
  console.log("route for company");
  const userId = req.userData.userId;
  try {
    const result = await prisma.link.findMany({
      select: { company: true },
      where: { userId: userId },
      distinct: ["company"],
    });
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "something went wrong" });
  }
});

//add a link
router.post("/add", auth, async (req: any, res) => {
  console.log("route for adding");
  console.log(req.body);
  const url: string = req.body.url;

  const result = await isUrlExist(url);
  if (result) {
    return res.status(404).json({ msg: "link already exist" });
  }
  console.log(req.body.remindat);

  let link;
  const userId = req.userData.userId;
  const companyName: string = extractHostName(url);
  try {
    link = await prisma.link.create({
      data: {
        url: url,
        company: companyName,
        note: req.body.note,
        user: {
          connect: { id: userId },
        },
        remindat: new Date(req.body.remindat),
        needRemind: req.body.remindat === "" ? false : req.body.needRemind,
      },
    });
    console.log(link);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "something went wrong" });
  }

  return res.status(200).json(link);
});

//update link
//add a link
router.post("/update", auth, async (req: any, res) => {
  console.log("route for updating");
  let link;
  const userId = req.userData.userId;
  try {
    const link = await prisma.link.update({
      where: { id: req.body.id },
      data: {
        note: req.body.note,
        remindat: new Date(req.body.remindat),
        needRemind: req.body.remindat === "" ? false : req.body.needRemind,
      },
    });
    console.log(link);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "something went wrong" });
  }

  return res.status(200).json(link);
});

//delete a link
router.delete("/delete/:id", auth, async (req: any, res) => {
  console.log("route for delete");
  try {
    const result = await prisma.link.delete({
      where: { id: parseInt(req.params.id) },
    });
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "something went wrong" });
  }
});

async function isUrlExist(url: string) {
  const result = await prisma.link.findUnique({
    where: {
      url: url,
    },
  });

  if (result === null) {
    return false;
  } else {
    return result;
  }
}

function extractHostName(url: string): string {
  const u = new URL(url);
  return u.hostname.split(".")[0];
}

export default router;
