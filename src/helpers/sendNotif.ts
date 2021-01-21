import { addSyntheticLeadingComment } from "typescript";
import { admin } from "../index";

function sendNotif(messages: any[]) {
  admin
    .messaging()
    .sendAll(messages)
    .then((response) => {
      console.log(response.successCount + " messages were sent successfully");
    });
}

export { sendNotif };
