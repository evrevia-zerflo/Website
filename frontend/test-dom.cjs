const { JSDOM } = require("jsdom");
const jsdom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {
  url: "http://localhost:5174/",
  runScripts: "dangerously",
  resources: "usable"
});

jsdom.window.addEventListener("error", (event) => {
  console.error("DOM ERROR:", event.error);
});
setTimeout(() => {
  console.log("WAITING 3 SECONDS...");
  process.exit(0);
}, 3000);
