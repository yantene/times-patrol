import { fetchTimeses } from "$/service/slack";

import { Channel } from "@slack/web-api/dist/response/ConversationsListResponse";

function createDummyChannel(channelSubset: Channel): Channel {
  return {
    id: "CXXXXXXXX",
    name: "times-dummy",
    is_channel: true,
    is_group: false,
    is_im: false,
    is_mpim: false,
    is_private: false,
    created: 1637236800, // 2021-11-18T21:00:00+09:00
    is_archived: false,
    is_general: false,
    unlinked: 0,
    name_normalized: "times-dummy",
    is_shared: false,
    is_org_shared: false,
    is_pending_ext_shared: false,
    pending_shared: [],
    creator: "UXXXXXXXX",
    is_ext_shared: false,
    shared_team_ids: ["TXXXXXXXX"],
    pending_connected_team_ids: [],
    is_member: false,
    topic: {
      value: "",
      creator: "UXXXXXXXX",
      last_set: 1637240400, // 2021-11-18T22:00:00+09:00
    },
    purpose: {
      value: "",
      creator: "UXXXXXXXX",
      last_set: 1637240400, // 2021-11-18T22:00:00+09:00
    },
    previous_names: [],
    num_members: 50,
    ...channelSubset,
  };
}

jest.mock("@slack/web-api", () => ({
  WebClient: jest.fn(() => ({
    conversations: {
      list: jest.fn().mockResolvedValue({
        ok: true,
        channels: [
          createDummyChannel({ name: "times-hoge" }),
          createDummyChannel({ name: "times_fuga" }),
          createDummyChannel({ name: "anken-piyo" }),
        ],
        response_metadata: {
          next_cursor: Buffer.from("team:AAAAAAAAA").toString("base64"),
          scopes: ["identify", "read", "post", "client", "apps"],
          acceptedScopes: [
            "channels:read",
            "groups:read",
            "mpim:read",
            "im:read",
            "read",
          ],
        },
      }),
    },
  })),
}));

describe("#fetchTimeses()", () => {
  test("times チャンネルのみが返されること", async () => {
    const timeses = await fetchTimeses(["times-", "times_"]);

    timeses.forEach(({ name }) => {
      expect(name).toEqual(expect.stringMatching(/^times[-_]/));
    });
  });

  test("返り値に times-hoge と times_fuga が含まれること", async () => {
    const timeses = await fetchTimeses(["times-", "times_"]);
    const timesNames = timeses.map(({ name }) => name);

    ["times-hoge", "times_fuga"].forEach((name) => {
      expect(timesNames).toContain(name);
    });
  });
});
