import { AuthenticatedRequest, require_writer } from "@/auth";
import { ErrorResponse, Herder } from "@/interfaces";
import { parse_body } from "@/lib";
import { add_herder, list_herders } from "@/redis";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

export default async function handler(req: NextApiRequest, res: NextApiResponse<Herder | ErrorResponse | Herder[]>) {
  switch (req.method) {
    case "POST":
      return post_herders(req, res);
    case "GET":
      return get_herders(req, res);
    default:
      return res.status(405).json({ error: `Invalid method: ${req.method}` });
  }
}

async function get_herders(req: NextApiRequest, res: NextApiResponse<Herder[]>) {
  const data = await list_herders();
  res.status(200).json(data);
}

export const herderSchema = z.object({
  id: z.optional(z.string()),
  name: z.string(),
});

const post_herders = require_writer(
  parse_body(herderSchema, async (req: AuthenticatedRequest, res: NextApiResponse, content) => {
    let herder = content;
    try {
      herder = await add_herder(herder);
    } catch (error) {
      console.log(error);
      if (error instanceof Error) error = error.message;
      return res.status(400).json({ error });
    }
    return res.status(201).json(herder);
  })
);
