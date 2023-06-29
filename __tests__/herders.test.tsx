import { createMocks } from "node-mocks-http";
import { describe, expect, test } from "@jest/globals";
import handler from "@/pages/api/herders";
import { clear_redis, get_herder } from "@/redis";
import { post } from "../testlib";

describe("/api/herders", () => {
  const body = { name: "test" };

  test("Should not allow unauthorized access or access to reader", async () => {
    await post(handler, body, undefined, 401);
    await post(handler, body, "reader", 401);
  });

  test("Can register new herder", async () => {
    await clear_redis();
    let res = await post(handler, body, "writer", 201);
    expect(res.id).toBeDefined();
    const result = await get_herder(res.id);
    expect(result?.name).toBe("test");
  });
  handler;
});
