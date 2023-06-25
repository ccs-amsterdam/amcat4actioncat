import { NextApiRequest, NextApiResponse } from "next";
import { ZodSchema, z } from "zod";
import { AuthenticatedRequest } from "./auth";

type ObjectHandler<T> = (req: AuthenticatedRequest, res: NextApiResponse, content: T) => void;

export function parse_body<T>(schema: ZodSchema<T>, wrapped: ObjectHandler<T>) {
  const wrapper = async (req: AuthenticatedRequest, res: NextApiResponse) => {
    let content;
    try {
      content = await schema.parseAsync(req.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error = error.issues.map((e) => ({ path: e.path[0], message: e.message }));
      } else {
        error = (error as Error).message;
      }
      return res.status(401).json({ message: error });
    }
    return wrapped(req, res, content);
  };
  return wrapper;
}
