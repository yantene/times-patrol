import { webClient } from "$/bull/slack/jobs/webClient";
import { Member } from "@slack/web-api/dist/response/UsersListResponse";

// Web API methods: https://api.slack.com/methods
// web api package: https://slack.dev/node-slack-sdk/web-api

/**
 * ワークスペースに所属するすべてのSlack ユーザを取得する。
 * @returns 取得したユーザの配列。
 */
export function fetchAllUsers(): Promise<Member[]> {
  return webClient.paginate(
    "users.list",
    {},
    ({ response_metadata }) => response_metadata?.next_cursor == null,
    (prv, { members }) => [
      ...(prv ?? []),
      ...((members as Member[] | undefined) ?? []),
    ]
  );
}
