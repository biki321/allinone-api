import { Router } from "express";
import { prisma } from "../index";
import auth from "./verifyToken";
import { URL } from "url";
import { parse, ParsedDomain, ParseError } from "psl";
import urlMetadata from "url-metadata";

const router = Router();

//return rows queried by column company
router.get("/links/:company", auth, async (req: any, res) => {
  const userId = req.userData.userId;
  let metadataPlusRes: any[] = [];
  try {
    const result = await prisma.link.findMany({
      where: { userId: userId, company: req.params.company },
    });

    metadataPlusRes = await Promise.all(
      result.map(async (ele) => {
        try {
          const r = await urlMetadata(ele.url);
          return {
            ...ele,
            title: r.title,
            image:
              r.image === null || r.image === undefined || r.image === ""
                ? "https://dummyimage.com/200x100/868787/ebecf0.png&text=No+Image+Available"
                : r.image,
          };
        } catch (error) {
          return {
            ...ele,
            title: "faulty link",
            image:
              "https://dummyimage.com/200x100/868787/ebecf0&text=Faulty+Url",
          };
        }
      })
    );
    return res.status(200).json(metadataPlusRes);
  } catch (error) {
    return res.status(500).json({ msg: "something went wrong" });
  }
});

//return distinct values of column 'company'
router.get("/company", auth, async (req: any, res) => {
  const userId = req.userData.userId;
  try {
    const result = await prisma.link.findMany({
      select: { company: true },
      where: { userId: userId },
      distinct: ["company"],
    });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ msg: "something went wrong" });
  }
});

//add a link
router.post("/add", auth, async (req: any, res) => {
  const url: string = req.body.url;

  const result = await isUrlExist(url);
  if (result) {
    return res.status(404).json({ msg: "link already exist" });
  }

  let link;
  const userId = req.userData.userId;

  try {
    let companyName: string | null = extractHostName(url);
    if (!companyName) {
      companyName = "some-company";
    }
    console.log(new Date());
    console.log("date direct: ", req.body.remindat);
    console.log("date :::", new Date(req.body.remindat));
    console.log("date to save:", new Date(req.body.remindat).toISOString());
    link = await prisma.link.create({
      data: {
        url: url,
        company: companyName,
        note: req.body.note,
        user: {
          connect: { id: userId },
        },
        remindat: req.body.remindat,
        needRemind: req.body.remindat === "" ? false : req.body.needRemind,
      },
    });
  } catch (error) {
    return res.status(500).json({ msg: "something went wrong" });
  }

  return res.status(200).json(link);
});

//update link
//add a link
router.post("/update", auth, async (req: any, res) => {
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
  } catch (error) {
    return res.status(500).json({ msg: "something went wrong" });
  }

  return res.status(200).json(link);
});

//delete a link
router.delete("/delete/:id", auth, async (req: any, res) => {
  try {
    const result = await prisma.link.delete({
      where: { id: parseInt(req.params.id) },
    });
    return res.status(200).json(result);
  } catch (error) {
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

function extractHostName(url: string): string | null {
  const u = new URL(url);
  // return u.hostname.split(".")[0];

  const parsed = parse(u.hostname);
  if (parsed.error === undefined) {
    const sld = parsed.sld;
    return sld;
  } else {
    throw "url wrong";
  }
}

export default router;
