import { WebClient, PaginatePredicate } from "@slack/web-api";
import { ConversationsListArguments } from "@slack/web-api/dist/methods";
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
      paginate(
        method: "conversations.list",
        options: ConversationsListArguments,
        shouldStop: (
          page: ConversationsListResponse
        ) => boolean | undefined | void,
        reduce?: (
          accumulator: Channel[] | undefined,
          page: ConversationsListResponse,
          index: number
        ) => Channel[]
      ): Promise<Channel[]>;
    },
  },
  async (
    { webClient },
    prefixes: string[] = ["times-", "times_"]
  ): Promise<Channel[]> => {
    // https://slack.dev/node-slack-sdk/web-api#pagination
    const channels = await webClient.paginate(
      "conversations.list",
      {},
      ({ response_metadata }) => response_metadata?.next_cursor == null,
      (prv, { channels }) => [...(prv ?? []), ...(channels ?? [])]
    );

    const timeses =
      channels.filter((channel) =>
        prefixes.some((prefix) => channel.name?.startsWith(prefix))
      ) ?? [];
    return timeses;
  }
);
