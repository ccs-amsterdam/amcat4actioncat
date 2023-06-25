import { AuthenticatedRequest, MiddlecatUser, get_server_role, require_authentication, require_writer } from "@/auth";
import { parse_body } from "@/lib";
import { add_job, list_jobs } from "@/redis";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "POST":
      return do_post_jobs(req, res);
    case "GET":
      return do_get_jobs(req, res);
    default:
      return res.status(405).json({ error: `Invalid method: ${req.method}` });
  }
}

const do_get_jobs = require_writer(async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const jobs = await list_jobs(req.user.email);
  console.log(jobs);
  return res.status(200).json(jobs);
});
export const jobSchema = z.object({
  index: z.string(),
  host: z.string(),
  token: z.string(),
  workflow: z.string(),
  query: z.optional(z.string()),
});
const do_post_jobs = require_writer(
  parse_body(jobSchema, async (req: AuthenticatedRequest, res: NextApiResponse, content) => {
    const job = { ...content, user: req.user.email };
    await add_job(job);
    res.status(204).end();
  })
);
