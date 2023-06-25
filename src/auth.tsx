import jwt from "jsonwebtoken";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

async function get_middlecat_key() {
  const config = await axios.get("https://middlecat.up.railway.app/api/configuration");
  return config.data.public_key;
}

export interface MiddlecatUser {
  email: string;
  resource: string;
  token: string;
}

export interface AuthenticatedRequest extends NextApiRequest {
  user: MiddlecatUser;
}

export async function get_user(req: NextApiRequest): Promise<MiddlecatUser> {
  const authToken = (req.headers.authorization || "").split("Bearer ").at(1);
  if (authToken == null) throw new Error("No authentication token provided");
  const key = await get_middlecat_key();
  const result = jwt.verify(authToken, key) as jwt.JwtPayload;
  return { ...result, token: authToken } as MiddlecatUser;
}

export async function get_server_role(user: MiddlecatUser): Promise<string> {
  const url = `${user.resource}/users/me`;

  const result = await axios.get(url, { headers: { Authorization: `Bearer ${user.token}` } });
  return result.data.role;
}
type ApiHandler = (req: AuthenticatedRequest, res: NextApiResponse) => void;

export function require_authentication(wrapped: ApiHandler) {
  const wrapper = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      (req as AuthenticatedRequest).user = await get_user(req);
    } catch (error) {
      return res.status(401).json({ message: (error as Error).message });
    }
    return wrapped(req as AuthenticatedRequest, res);
  };
  return wrapper;
}

export function require_writer(wrapped: ApiHandler) {
  const wrapper = async (req: AuthenticatedRequest, res: NextApiResponse) => {
    let role;
    try {
      role = await get_server_role(req.user);
    } catch (error) {
      const message = `Error on getting server role for ${req.user.email}: ${(error as Error).message}`;
      return res.status(401).json({ message });
    }
    if (role !== "ADMIN" && role !== "WRITER") {
      return res.status(401).json({ message: `Requires WRITER role, user ${req.user.email} has ${role}` });
    }
    return wrapped(req, res);
  };
  return require_authentication(wrapper);
}
