import { WebClient } from "@slack/web-api";
import {
  Channel,
  ConversationsListResponse,
} from "@slack/web-api/dist/response/ConversationsListResponse";
import { SLACK_BOT_TOKEN } from "./envValues";

import { depend } from "velona";

const webClient = new WebClient(SLACK_BOT_TOKEN);

/**
 * times チャンネルのリストを取得する。
 * @param prefixes times チャンネルの接頭辞の配列。
 * @returns 該当する times チャンネルの配列。
 */
export const fetchTimeses = depend(
  {
    webClient: webClient as {
      conversations: { list(): Promise<ConversationsListResponse> };
    },
  },
  async (
    { webClient },
    prefixes: string[] = ["times-", "times_"]
  ): Promise<Channel[]> => {
    const convs = await webClient.conversations.list();

    const timeses =
      convs.channels?.filter((channel) =>
        prefixes.some((prefix) => channel.name?.startsWith(prefix))
      ) ?? [];

    return timeses;
  }
);
