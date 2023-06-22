import { ErrorResponse, Herder } from "@/interfaces";
import { delete_herder, get_herder } from "@/redis";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Herder | ErrorResponse>
) {
  switch (req.method) {
    case "GET":
      return do_get_herder(req, res);
    case "DELETE":
      return do_delete_herder(req, res);
    default:
      return res.status(405).json({ error: `Invalid method: ${req.method}` });
  }
}

async function do_get_herder(
  req: NextApiRequest,
  res: NextApiResponse<Herder | ErrorResponse>
) {
  const result = await get_herder(req.query.herder as string);
  if (result == null)
    return res
      .status(404)
      .json({ error: `Herder ${req.query.herder} not registered` });
  return res.status(200).json(result);
}

async function do_delete_herder(
  req: NextApiRequest,
  res: NextApiResponse<ErrorResponse>
) {
  const existed = await delete_herder(req.query.herder as string);
  if (!existed)
    return res
      .status(404)
      .json({ error: `Herder ${req.query.herder} not registered` });
  res.status(204).end();
}
