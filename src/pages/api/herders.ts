// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ErrorResponse, Herder } from "@/interfaces";
import { add_herder, list_herders } from "@/redis";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod"


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

function get_query_int(value: string | string[] | undefined, default_: number): number {
  if (value == null) return default_
  if (Array.isArray(value)) value = value[0]
  return parseInt(value)
}

async function get_herders(req: NextApiRequest, res: NextApiResponse<Herder[]>) {
  const data = await list_herders();
  res.status(200).json( data)
}

export const herderSchema = z.object({
  id: z.optional(z.string()),
  name: z.string()
})
async function post_herders(req: NextApiRequest, res: NextApiResponse<Herder | ErrorResponse>) {
  let herder;
  try {
    herder = await herderSchema.parseAsync(req.body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      error = error.issues.map((e) => ({ path: e.path[0], message: e.message }));
    }
    return res.status(422).json({error});
  }
  try {
    herder = await add_herder(herder);
  } catch (error) {
    console.log(error)
    if (error instanceof Error) error = error.message
    return res.status(400).json({error})
  }
  return res.status(201).json(herder);
}
