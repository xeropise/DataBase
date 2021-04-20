const startEnd = require("./main.js");
const cron = require("node-cron");

var task = cron.schedule("* * * * *", async () => {
  console.log("running a task event every minute");
  await startEnd();
});

task.start();
