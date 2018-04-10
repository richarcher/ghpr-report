const Github = require("./Github");
const config = require('./conf');

const github = new Github(config);

github.report().then(function(results) {
  const items = results.length > 0 ? results : ['*No Pull Requests!*'];
  console.log(`*:mega: Pull requests of the day*\n${items.join('\n')}\n`);
});