import Redis, { RedisOptions } from "ioredis";

export function redis(): Redis {
  const options: RedisOptions = {};
  return new Redis(options);
}

export interface Herder {
  name: string;
}

export async function add_herder(herder: Herder): Promise<void> {
  const herders = await list_herders();
  herders.push(herder);
  await redis().set("amcat4actioncat__herders", JSON.stringify(herders));
}

export async function list_herders(): Promise<Herder[]> {
  const herders = await redis().get("amcat4actioncat__herders");
  if (herders == null) return [];
  return JSON.parse(herders) as Herder[];
}
