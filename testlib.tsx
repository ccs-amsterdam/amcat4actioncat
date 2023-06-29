import { createMocks } from "node-mocks-http";
import { expect } from "@jest/globals";
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

function set_auth(req: NextApiRequest, user: string) {
  const token = jwt.sign({ resource: "http://example.com", email: `${user}@example.com` }, "secret");
  req.headers = { authorization: `Bearer ${token}` };
}

interface MockedApiResponse extends NextApiResponse {
  _getJSONData: () => any;
}

type Handler = (req: NextApiRequest, res: NextApiResponse) => Promise<any>;

export async function post(handler: Handler, body?: any, user?: string, expected = 200) {
  const { req, res }: { req: NextApiRequest; res: MockedApiResponse } = createMocks({ method: "POST" });
  if (user != null) set_auth(req, user);
  if (body != null) req.body = body;
  await handler(req, res);
  if (expected != null) expect(res.statusCode).toBe(expected);
  if (expected === 200 || expected === 201) return res._getJSONData();
}

export async function get(handler: Handler, user?: string, expected = 200) {
  const { req, res }: { req: NextApiRequest; res: MockedApiResponse } = createMocks({ method: "GET" });
  if (user != null) set_auth(req, user);
  await handler(req, res);
  if (expected != null) expect(res.statusCode).toBe(expected);
  if (expected === 200 || expected === 201) return res._getJSONData();
}
