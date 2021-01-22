import { addSyntheticLeadingComment } from "typescript";
import { admin } from "../index";

function sendNotif(messages: any[]) {
  admin
    .messaging()
    .sendAll(messages)
    .then((response) => {});
}

export { sendNotif };
