/*
 * /todo endpoint
 * This is intended for herders to ask for work to do
 */

import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      return get_todo(req, res);
    default:
      return res.status(405).json({ error: `Invalid method: ${req.method}` });
  }
}

async function get_todo(req: NextApiRequest, res: NextApiResponse) {}
