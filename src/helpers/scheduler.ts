import { schedule as cron } from "node-cron";
import moment from "moment";
import { prisma, admin } from "../index";

interface message {
  notification: {
    title: string;
    body: string;
    click_action?: string;
  };
  data?: any;
  token: string;
}

const scheduleStart = function () {
  cron("00 * * * * *", async function () {
    console.log(new Date());
    console.log("running send notification worker for" + moment().format());
    try {
      const date = new Date(new Date().setUTCSeconds(0, 0)).toISOString();
      console.log(date);
      const result = await prisma.link.findMany({
        where: {
          remindat: date,
          needRemind: true,
          user: {
            fcmtoken: {
              not: null,
            },
          },
        },
        select: {
          id: true,
          url: true,
          company: true,
          user: {
            select: {
              fcmtoken: true,
            },
          },
        },
      });
      console.log(result);
      if (result.length > 0) {
        const messages: message[] = [];
        result.forEach((ele) => {
          messages.push({
            notification: {
              title: `Reminder for ${ele.company}`,
              body: "click here to get to the post",
              click_action: ele.url,
            },
            data: {
              url: ele.url,
            },
            token: ele.user.fcmtoken!,
          });
        });
        admin
          .messaging()
          .sendAll(messages)
          .then((response) => {
            console.log(
              response.successCount + " messages were sent successfully"
            );
          });
      }
    } catch (error) {
      console.log(error);
    }
  });
};

export default scheduleStart;
