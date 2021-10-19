const fetch = require('node-fetch');
const fs = require('fs');

const dlImg = (async (githubToken, filePath, username) => {
  const url = `https://tryhackme-badges.s3.amazonaws.com/${username}.png`;
  const path = filePath;

  const res = await fetch(url);
  const fileStream = fs.createWriteStream(path);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);
    fileStream.on("finish", resolve);
  });
});

console.log('hello World');
dlImg('aa', './assets/thm_propic.png', 'p4p1');
