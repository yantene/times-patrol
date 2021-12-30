import { fetchMessages, fetchTimeses, fetchAllMembers } from "$/service/slack";

import { Channel } from "@slack/web-api/dist/response/ConversationsListResponse";
import { Message } from "@slack/web-api/dist/response/ConversationsHistoryResponse";
import { Member } from "@slack/web-api/dist/response/UsersListResponse";

import { DateTime } from "luxon";

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

function createDummyMessage(
  messageSubset: Message,
  hasAttachments = false
): Message {
  return {
    type: "message",
    user: "U012AB3CDE",
    text: "I find you punny and would like to smell your nose letter",
    ts: "1512085950.000216",
    ...(hasAttachments
      ? {
          has_attachments: {
            service_name: "Leg end nary a laugh, Ink.",
            text: "This is likely a pun about the weather.",
            fallback: "We're withholding a pun from you",
            thumb_url: "https://badpuns.example.com/puns/123.png",
            thumb_width: 1920,
            thumb_height: 700,
            id: 1,
          },
        }
      : {}),
    ...messageSubset,
  };
}

describe("#fetchMessages()", () => {
  const injectedFetchMessages = fetchMessages.inject({
    webClient: {
      paginate: jest.fn().mockResolvedValue([
        createDummyMessage({
          text: "あしたは誕生日だよ",
          ts: DateTime.fromISO(
            "2021-11-17T21:00:00+09:00"
          ).toSeconds.toString(),
        }),
        createDummyMessage(
          {
            text: "きょうは誕生日だよ",
            ts: DateTime.fromISO(
              "2021-11-18T21:00:00+09:00"
            ).toSeconds.toString(),
          },
          true
        ),
        createDummyMessage({
          text: "よい誕生日だったな",
          ts: DateTime.fromISO(
            "2021-11-19T00:00:00+09:00"
          ).toSeconds.toString(),
        }),
      ]),
    },
  });

  test("メッセージを取得できること", async () => {
    const messages = await injectedFetchMessages("C012AB3CD", [
      DateTime.fromISO("2021-11-17T00:00:00+09:00"),
      DateTime.fromISO("2021-11-18T23:59:59+09:00"),
    ]);

    expect(messages.length).toBeGreaterThan(0);
  });

  // TODO: うまくモックする必要がある
  xtest("期間指定が正しく動作すること", () => ({}));
});

function createDummyMember(memberSubset: Member): Member {
  return {
    id: "U012A3CDE",
    team_id: "T012AB3C4",
    name: "spengler",
    deleted: false,
    color: "9f69e7",
    real_name: "spengler",
    tz: "Asia/Tokyo",
    tz_label: "Japan Standard Time",
    tz_offset: 32400,
    profile: {
      avatar_hash: "ge3b51ca72de",
      status_text: "Print is dead",
      status_emoji: ":books:",
      real_name: "Egon Spengler",
      display_name: "spengler",
      real_name_normalized: "Egon Spengler",
      display_name_normalized: "spengler",
      email: "spengler@ghostbusters.example.com",
      image_24: "http://placehold.jp/24x24.png",
      image_32: "http://placehold.jp/32x32.png",
      image_48: "http://placehold.jp/48x48.png",
      image_72: "http://placehold.jp/72x72.png",
      image_192: "http://placehold.jp/192x192.png",
      image_512: "http://placehold.jp/512x512.png",
      team: "T012AB3C4",
    },
    is_admin: false,
    is_owner: false,
    is_primary_owner: false,
    is_restricted: false,
    is_ultra_restricted: false,
    is_bot: false,
    updated: 1502138686,
    is_app_user: false,
    has_2fa: false,
    ...memberSubset,
  };
}

describe("#fetchAllMembers()", () => {
  const injectedFetchAllMembers = fetchAllMembers.inject({
    webClient: {
      paginate: jest
        .fn()
        .mockResolvedValue([
          createDummyMember({ name: "Taro" }),
          createDummyMember({ name: "Jiro" }),
          createDummyMember({ name: "Saburo" }),
        ]),
    },
  });

  test("メンバーを取得できること", async () => {
    const members = await injectedFetchAllMembers();

    expect(members.length).toBeGreaterThan(0);
  });
});
