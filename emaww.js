//Imports
const redis = require("redis");
const fs = require("fs");
//Node package at https://www.npmjs.com/package/xml2json
const parser = require("xml2json");

const filePath = "./config.xml";
let finalKeys = {};

function parseXML(data) {
  var options = {
    object: true, //As per documentation, setting object to true returns a JavaScript object
    reversible: false,
    coerce: false,
    sanitize: true,
    trim: true,
    arrayNotation: false,
    alternateTextNode: false,
  };

  return parser.toJson(data, options);
}

function segregateKeys(jsObject) {
  let subDomain = {};
  const subDomains = jsObject.config.subdomains.subdomain;
  subDomain.subdomains = subDomains;

  const cookies = jsObject.config.cookies.cookie;
  //Design the pattern for the keys of the cookies
  const cookiesKey = cookies.map((cookie) => {
    const redisKey = `cookie:${cookie.name}:${cookie.host}`;
    const value = cookie["$t"];
    return { [redisKey]: value };
  });
  //using reduce to collect each object and using the initial value of subDomain object to add onto it
  return cookiesKey.reduce((acc, cookie) => {
    return { ...acc, ...cookie };
  }, subDomain);
}

async function setUpRedis(client, finalKeys) {
  client.on("error", (err) => console.log("Redis Client Error", err));

  await client.connect();

  for (const key in finalKeys) {
    const value = finalKeys[key];
    await client.set(key, JSON.stringify(value));
  }
  const subDomains = await client.get("subdomains");
  console.log("subdomains: ", subDomains);
  const cookie = await client.get("cookie:dlp-avast:forest");
  console.log(cookie); //mmm_for_dlp_777_ppc_m
}

function createRedisKeys(data, client) {
  const jsObject = parseXML(data);
  finalKeys = segregateKeys(jsObject);
  setUpRedis(client, finalKeys);
}

//Usage

fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.log("error reading the xml file: ", err);
    return;
  }

  const client = redis.createClient({
    url: "redis://redis:6379",
  });

  createRedisKeys(data, client);
});
