import Redis, { RedisOptions } from "ioredis";
import { Herder } from "./interfaces";

const KEY = "amcat4actioncat__herders";

let _REDIS: Redis | void;

export async function get_redis(): Promise<Redis> {
  if (_REDIS == null) {
    const options: RedisOptions = {};
    console.log("Connecting to redis");
    _REDIS = new Redis(options);
    if ((await _REDIS.type(KEY)) !== "hash") {
      console.log(`Redis type for ${KEY} is not hash, deleting`);
      _REDIS.del(KEY);
    }
  }
  return _REDIS;
}

async function generate_herder_id(redis: Redis, name: string): Promise<string> {
  let id = name;
  for (var i = 1; ; i++) {
    if (!(await redis.hexists(KEY, id))) return id;
    id = `${name}_${i}`;
  }
}

export async function add_herder(herder: Herder): Promise<Herder> {
  const redis = await get_redis();
  if (herder.id == null)
    herder.id = await generate_herder_id(redis, herder.name);
  else if (await redis.hexists(KEY, herder.id))
    throw new Error(`A herder with id ${herder.id} already exists`);
  await redis.hset(KEY, { [herder.id]: JSON.stringify(herder) });
  return herder;
}

export async function list_herders(): Promise<Herder[]> {
  const redis = await get_redis();
  return (await redis.hvals(KEY)).map((json) => JSON.parse(json)) as Herder[];
}

export async function get_herder(id: string): Promise<Herder | void> {
  const redis = await get_redis();
  const json = await redis.hget(KEY, id);
  return json == null ? null : JSON.parse(json);
}

export async function delete_herder(id: string): Promise<boolean> {
  const redis = await get_redis();
  return (await redis.hdel(KEY, id)) > 0;
}
