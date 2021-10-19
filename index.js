const fetch = require('node-fetch');
const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
const FILEPATH = core.getInput("image_path");

core.setSecret(GITHUB_TOKEN);

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
console.log(GITHUB_TOKEN);
console.log(FILEPATH);
console.log(process.env.GITHUB_REPOSITORY);
dlImg(GITHUB_TOKEN, FILEPATH, 'p4p1');
