const fs = require("fs");
const filePath = "./config.xml";
const file = fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.log("error reading the xml file: ", err);
    return;
  }
  data.parse
});
