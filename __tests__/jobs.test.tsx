import { describe, expect, test } from "@jest/globals";
import handler from "@/pages/api/jobs";
import { get, post } from "../testlib";
import { clear_redis } from "@/redis";
describe("/api/jobs", () => {
  const body = { index: "test", host: "http://example.com", token: "geheim", workflow: "test" };

  test("Should not allow unauthorized access or access to reader", async () => {
    await post(handler, body, undefined, 401);
    await post(handler, body, "reader", 401);
  });

  test("Can post jobs and list own jobs", async () => {
    await clear_redis();
    await post(handler, body, "writer", 204);
    const jobs = await get(handler, "writer");
    console.debug(jobs);
  });
});
