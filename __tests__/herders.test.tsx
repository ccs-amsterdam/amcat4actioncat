// __tests__/animal.test.js
// 🚨 Remember to keep your `*.test.js` files out of your `/pages` directory!
import { createMocks, RequestMethod } from "node-mocks-http";
import { describe, expect, it, test } from "@jest/globals";
import handler from "@/pages/api/herders";
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { clear_redis, get_herder } from "@/redis";

function set_auth(req: NextApiRequest, user: string) {
  const token = jwt.sign({ resource: "http://example.com", email: `${user}@example.com` }, "secret");
  req.headers = { authorization: `Bearer ${token}` };
}

async function post(body?: any, user?: string, expected = 200) {
  const { req, res }: { req: NextApiRequest; res: NextApiResponse } = createMocks({ method: "POST" });
  if (user != null) set_auth(req, user);
  if (body != null) req.body = body;
  await handler(req, res);
  if (expected != null) expect(res.statusCode).toBe(expected);
  if (expected === 200 || expected == 201) return res._getJSONData();
}

describe("/api/herders", () => {
  const body = { name: "test" };

  it("Should not allow unauthorized access or access to reader", async () => {
    await post(body, undefined, 401);
    await post(body, "reader", 401);
  });

  it("Can register new herder", async () => {
    await clear_redis();

    let res = await post(body, "writer", 201);
    const id = res.id;
    expect(id).toBeDefined();
    const result = await get_herder(id);
    expect(result?.name).toBe("test");
  });
  handler;
});
