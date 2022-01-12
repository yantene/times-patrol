import { webClient } from "$/bull/slack/jobs/webClient";
import { fetchAllUsers } from "$/bull/slack/jobs/updateUsers";
import { generateUser } from "./dummyGenerators";

describe("#fetchAllUsers()", () => {
  const apiCallSpy = jest.spyOn(webClient, "apiCall");

  afterEach(() => {
    apiCallSpy.mockReset();
  });

  test("レスポンスに next_cursor がないと webClient#apiCall が 1 回だけ呼ばれること", async () => {
    apiCallSpy.mockResolvedValueOnce({
      ok: true,
      members: [],
      cache_ts: 1498777272,
      response_metadata: {},
    });

    await fetchAllUsers();

    expect(
      (webClient.apiCall as jest.MockedFunction<typeof webClient.apiCall>).mock
        .calls
    ).toHaveLength(1);
  });

  test("レスポンスに next_cursor があると webClient#apiCall がその回数呼ばれること", async () => {
    apiCallSpy
      .mockResolvedValueOnce({
        ok: true,
        members: [],
        cache_ts: 1498777272,
        response_metadata: { next_cursor: "dXNlcjpVMEc5V0ZYTlo=" },
      })
      .mockResolvedValueOnce({
        ok: true,
        members: [],
        cache_ts: 1498777272,
        response_metadata: {},
      });

    await fetchAllUsers();

    expect(
      (webClient.apiCall as jest.MockedFunction<typeof webClient.apiCall>).mock
        .calls
    ).toHaveLength(2);
  });

  test("レスポンスに適切な Member が含まれること", async () => {
    const user1 = generateUser({ name: "yantene" });
    const user2 = generateUser({ name: "enetnay" });

    apiCallSpy
      .mockResolvedValueOnce({
        ok: true,
        members: [user1],
        cache_ts: 1498777272,
        response_metadata: { next_cursor: "dXNlcjpVMEc5V0ZYTlo=" },
      })
      .mockResolvedValueOnce({
        ok: true,
        members: [user2],
        cache_ts: 1498777272,
        response_metadata: {},
      });

    const users = await fetchAllUsers();

    expect(users).toContain(user1);
    expect(users).toContain(user2);
  });
});
