import { ConversationsMembersResponse, WebClient } from "@slack/web-api";
import {
  ConversationsListArguments,
  ConversationsHistoryArguments,
  UsersListArguments,
  ConversationsMembersArguments,
} from "@slack/web-api/dist/methods";
import {
  Channel,
  ConversationsListResponse,
} from "@slack/web-api/dist/response/ConversationsListResponse";
import {
  Message,
  ConversationsHistoryResponse,
} from "@slack/web-api/dist/response/ConversationsHistoryResponse";
import {
  Member,
  UsersListResponse,
} from "@slack/web-api/dist/response/UsersListResponse";
import { DateTime } from "luxon";

import { SLACK_BOT_TOKEN } from "./envValues";

import { depend } from "velona";

const webClient = new WebClient(SLACK_BOT_TOKEN);

// Web API methods: https://api.slack.com/methods
// web api package: https://slack.dev/node-slack-sdk/web-api

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

/**
 * メッセージのリストを取得する。
 * @param channelId 取得対象のチャンネルの ID。
 * @param targetPeriod 取得対象の期間。
 * @returns 取得したメッセージの配列。
 */
export const fetchMessages = depend(
  {
    webClient: webClient as {
      paginate(
        method: "conversations.history",
        options: ConversationsHistoryArguments,
        shouldStop: (
          page: ConversationsHistoryResponse
        ) => boolean | undefined | void,
        reduce?: (
          accumulator: Message[] | undefined,
          page: ConversationsHistoryResponse,
          index: number
        ) => Message[]
      ): Promise<Message[]>;
    },
  },
  ({ webClient }, channelId: string, targetPeriod: [DateTime, DateTime]) => {
    // https://slack.dev/node-slack-sdk/web-api#pagination
    return webClient.paginate(
      "conversations.history",
      {
        channel: channelId,
        latest: DateTime.max(...targetPeriod)
          .toSeconds()
          .toString(),
        oldest: DateTime.max(...targetPeriod)
          .toSeconds()
          .toString(),
      },
      ({ has_more }) => has_more,
      (prv, { messages }) => [...(prv ?? []), ...(messages ?? [])]
    );
  }
);

/**
 * ワークスペースに所属するすべてのメンバーを取得する。
 * @returns 取得したメンバーの配列。
 */
export const fetchAllMembers = depend(
  {
    webClient: webClient as {
      paginate(
        method: "users.list",
        options: UsersListArguments,
        shouldStop: (page: UsersListResponse) => boolean | undefined | void,
        reduce?: (
          accumulator: Member[] | undefined,
          page: UsersListResponse,
          index: number
        ) => Member[]
      ): Promise<Member[]>;
    },
  },
  ({ webClient }) => {
    return webClient.paginate(
      "users.list",
      {},
      ({ response_metadata }) => response_metadata?.next_cursor == null,
      (prv, { members }) => [...(prv ?? []), ...(members ?? [])]
    );
  }
);

/**
 * そのチャンネルに参加しているメンバーの ID を取得する。
 * @param channelId 取得対象のチャンネルの ID。
 * @returns 取得したメンバー ID の配列。
 */
export const fetchMemberIdsByChannelId = depend(
  {
    webClient: webClient as {
      paginate(
        method: "conversations.members",
        options: ConversationsMembersArguments,
        shouldStop: (
          page: ConversationsMembersResponse
        ) => boolean | undefined | void,
        reduce?: (
          accumulator: string[] | undefined,
          page: ConversationsMembersResponse,
          index: number
        ) => string[]
      ): Promise<string[]>;
    },
  },
  ({ webClient }, channelId: string) => {
    return webClient.paginate(
      "conversations.members",
      { channel: channelId },
      ({ response_metadata }) => response_metadata?.next_cursor == null,
      (prv, { members }) => [...(prv ?? []), ...(members ?? [])]
    );
  }
);
