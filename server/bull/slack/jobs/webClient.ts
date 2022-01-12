import { WebClient } from "@slack/web-api";
import { SLACK_BOT_TOKEN } from "$/service/envValues";

export const webClient = new WebClient(SLACK_BOT_TOKEN);
