import Redis, { RedisOptions } from "ioredis";
import { Herder, Job } from "./interfaces";

const KEY_HERDERS = "amcat4actioncat__herders";
const KEY_JOBS = "amcat4actioncat__jobs";
const _TYPES = {
  [KEY_HERDERS]: "hash",
  [KEY_JOBS]: "list",
};

let _REDIS: Redis | void;

export async function get_redis(): Promise<Redis> {
  if (_REDIS == null) {
    const options: RedisOptions = {};
    console.log("Connecting to redis");
    _REDIS = new Redis(options);
    for (const [key, etype] of Object.entries(_TYPES)) {
      const atype = await _REDIS.type(key);
      if (atype !== "none" && atype !== etype)
        console.log(`Redis type for ${key} is ${atype}, expected ${etype}, deleting`);
    }
  }
  return _REDIS;
}

export async function clear_redis() {
  const redis = await get_redis();
  for (var key in _TYPES) {
    console.debug(key);
    await redis.del(key);
  }
}

/* Herders */

async function generate_herder_id(redis: Redis, name: string): Promise<string> {
  let id = name;
  for (var i = 1; ; i++) {
    if (!(await redis.hexists(KEY_HERDERS, id))) return id;
    id = `${name}_${i}`;
  }
}

export async function add_herder(herder: Herder): Promise<Herder> {
  const redis = await get_redis();
  if (herder.id == null) herder.id = await generate_herder_id(redis, herder.name);
  else if (await redis.hexists(KEY_HERDERS, herder.id)) throw new Error(`A herder with id ${herder.id} already exists`);
  await redis.hset(KEY_HERDERS, { [herder.id]: JSON.stringify(herder) });
  return herder;
}

export async function list_herders(): Promise<Herder[]> {
  const redis = await get_redis();
  return (await redis.hvals(KEY_HERDERS)).map((json) => JSON.parse(json)) as Herder[];
}

export async function get_herder(id: string): Promise<Herder | void> {
  const redis = await get_redis();
  const json = await redis.hget(KEY_HERDERS, id);
  return json == null ? null : JSON.parse(json);
}

export async function delete_herder(id: string): Promise<boolean> {
  const redis = await get_redis();
  return (await redis.hdel(KEY_HERDERS, id)) > 0;
}

/* Job CRUD */

export async function add_job(job: Job) {
  const redis = await get_redis();
  redis.lpush(KEY_JOBS, JSON.stringify(job));
}

export async function list_jobs(user: string): Promise<Job[]> {
  const redis = await get_redis();
  const n = await redis.llen(KEY_JOBS);
  const jobs = await redis.lrange(KEY_JOBS, 0, n);
  console.log(jobs);
  console.log(user);
  return jobs.map((x) => JSON.parse(x) as Job).filter((j) => j.user === user);
}
