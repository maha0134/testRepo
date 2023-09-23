const fs = require("fs");
//Node package at https://www.npmjs.com/package/xml2json
const parser = require("xml2json");
const filePath = "./config.xml";
fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.log("error reading the xml file: ", err);
    return;
  }
  //As per documentation, setting object to true returns a JavaScript object
  var options = {
    object: true,
    reversible: false,
    coerce: false,
    sanitize: true,
    trim: true,
    arrayNotation: false,
    alternateTextNode: false,
  };

  const jsObject = parser.toJson(data, options);
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
  const finalKeys = cookiesKey.reduce((acc, cookie) => {
    return { ...acc, ...cookie };
  }, subDomain);
  console.log(finalKeys);
});
