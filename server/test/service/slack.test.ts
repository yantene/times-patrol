import { fetchTimeses } from "$/service/slack";

import { Channel } from "@slack/web-api/dist/response/ConversationsListResponse";

function createDummyChannel(channelSubset: Channel): Channel {
  return {
    id: "C012AB3CD",
    name: "times-dummy",
    is_channel: true,
    is_group: false,
    is_im: false,
    created: 1637236800, // 2021-11-18T21:00:00+09:00
    creator: "U012A3CDE",
    is_archived: false,
    is_general: false,
    unlinked: 0,
    name_normalized: "times-dummy",
    is_shared: false,
    is_ext_shared: false,
    is_org_shared: false,
    pending_shared: [],
    is_pending_ext_shared: false,
    is_member: true,
    is_private: false,
    is_mpim: false,
    topic: {
      value: "Company-wide announcements and work-based matters",
      creator: "U012A3CDE",
      last_set: 1637240400, // 2021-11-18T22:00:00+09:00
    },
    purpose: {
      value:
        "This channel is for team-wide communication and announcements. All team members are in this channel.",
      creator: "U012A3CDE",
      last_set: 1637240400, // 2021-11-18T22:00:00+09:00
    },
    previous_names: [],
    num_members: 4,
    ...channelSubset,
  };
}

describe("#fetchTimeses()", () => {
  const injectedFetchTimeses = fetchTimeses.inject({
    webClient: {
      paginate: jest
        .fn()
        .mockResolvedValue([
          createDummyChannel({ name: "times-hoge" }),
          createDummyChannel({ name: "times_fuga" }),
          createDummyChannel({ name: "anken-piyo" }),
          createDummyChannel({ name: "times-foo" }),
          createDummyChannel({ name: "times_bar" }),
          createDummyChannel({ name: "anken-fizz" }),
        ]),
    },
  });

  test("times チャンネルのみが返されること", async () => {
    const timeses = await injectedFetchTimeses(["times-", "times_"]);

    timeses.forEach(({ name }) => {
      expect(name).toEqual(expect.stringMatching(/^times[-_]/));
    });
  });

  test("存在する times がすべて返り値に含まれること", async () => {
    const timeses = await injectedFetchTimeses(["times-", "times_"]);
    const timesNames = timeses.map(({ name }) => name);

    ["times-hoge", "times_fuga", "times-foo", "times_bar"].forEach((name) => {
      expect(timesNames).toContain(name);
    });
  });
});
