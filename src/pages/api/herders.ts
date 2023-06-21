// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { add_herder, list_herders } from "@/redis";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = { name: string };
type ErrorResponse = { message: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<void | ErrorResponse | Data[]>) {
  switch (req.method) {
    case "POST":
      return post_herders(req, res);
    case "GET":
      return get_herders(req, res);
    default:
      return res.status(405).json({ message: `Invalid method: ${req.method}` });
  }
}

async function get_herders(req: NextApiRequest, res: NextApiResponse<Data[]>) {
  res.status(200).json(await list_herders());
}

async function post_herders(req: NextApiRequest, res: NextApiResponse<void | ErrorResponse>) {
  console.log(req.body);
  if (req.body.name == null) return res.status(400).json({ message: "Please specify name" });
  const herder = { name: req.body.name };
  await add_herder(herder);
  return res.status(201).json();
}
