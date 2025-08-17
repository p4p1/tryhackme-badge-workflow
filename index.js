const { spawn } = require('child_process');
const core = require('@actions/core');
const fs = require('fs');
const puppeteer = require('puppeteer');

const WIDTH = 329;
const HEIGHT = 88;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const FILEPATH = process.env.IMAGE_PATH;
const THM_USERNAME = process.env.USERNAME;
const COMMITTER_USERNAME = process.env.COMMITTER_USERNAME;
const COMMITTER_EMAIL = process.env.COMMITTER_EMAIL;
const COMMIT_MESSAGE = process.env.COMMIT_MESSAGE;
const USE_STATIC_IMAGE = process.env.USE_STATIC_IMAGE === "true";
const USER_PUBLIC_ID = process.env.USER_PUBLIC_ID;

/*
 * Executes a command and returns its result as promise
 */
function exec(cmd, args = [], options = {}) {
  console.log(`[exec] Running command: ${cmd} ${args.join(' ')}`);
  return new Promise((resolve, reject) => {
    let outputData = '';
    const app = spawn(cmd, args, { ...options, stdio: 'pipe' });

    if (app.stdout) app.stdout.on('data', data => {
      outputData += data.toString();
      process.stdout.write(`[exec][stdout] ${data.toString()}`);
    });
    if (app.stderr) app.stderr.on('data', data => {
      outputData += data.toString();
      process.stderr.write(`[exec][stderr] ${data.toString()}`);
    });

    app.on('close', code => {
      console.log(`[exec] Process exited with code: ${code}`);
      if (code !== 0) return reject({ code, outputData });
      resolve({ code, outputData });
    });
    app.on('error', err => {
      console.error(`[exec] Error: ${err.message}`);
      reject({ code: 1, outputData: err.message });
    });
  });
}

core.setSecret(GITHUB_TOKEN);

async function htmlToPng(html, outputPath) {
  return puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  })
  .then(browser => {
    return browser.newPage()
      .then(page => {
        page.setViewport({ width: WIDTH, height: HEIGHT }).then(() => {
          return page.setContent(html, { waitUntil: 'networkidle0' })
            .then(() => page.screenshot({ 
              path: outputPath, 
              fullPage: false,
              clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT }
            }))
            .then(() => browser.close());
        });
      });
  });
}

/**
 * Downloads the image and commits/pushes it to GitHub.
 */
function dlImg(githubToken, filePath, username, useStaticImage, userPublicId) {
  let url = "";
  if (useStaticImage) {
    console.log('[dlImg] Using static image URL.');
    url = `https://tryhackme-badges.s3.amazonaws.com/${username}.png`;
  } else {
    console.log('[dlImg] Using dynamic image URL.');
    url = `https://tryhackme.com/api/v2/badges/public-profile?userPublicId=${userPublicId}`;
  }
  console.log(`[dlImg] Downloading image from: ${url}`);

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`[dlImg] Failed to download image: ${res.statusText}`);
      return res.arrayBuffer();
    })
    .then(buffer => {
      if (useStaticImage) {
      fs.writeFileSync(filePath, Buffer.from(buffer));
      console.log(`[dlImg] Image saved to: ${filePath}`);
      } else {
      const htmlContent = Buffer.from(buffer).toString('utf8');
      console.log('[dlImg] Converting HTML to PNG...');
      console.log(`[dlImg] Image saved to: ${filePath}`);
      return htmlToPng(htmlContent, filePath);
      }
    })
    .then(() => {
      console.log('[dlImg] Setting git user configuration...');
      return exec('git', ['config', '--global', 'user.email', COMMITTER_EMAIL]);
    })
    .then(() => exec('git', ['config', '--global', 'user.name', COMMITTER_USERNAME]))
    .then(() => {
      if (githubToken) {
        console.log('[dlImg] Updating git remote URL...');
        return exec('git', [
          'remote', 'set-url', 'origin',
          `https://${githubToken}@github.com/${process.env.GITHUB_REPOSITORY}.git`
        ]);
      }
    })
    .then(() => {
      console.log(`[dlImg] Adding file to git: ${filePath}`);
      return exec('git', ['add', filePath]);
    })
    .then(() => {
      console.log('[dlImg] Committing changes...');
      return exec('git', ['commit', '-m', COMMIT_MESSAGE]);
    })
    .then(() => {
      console.log('[dlImg] Pushing changes to remote...');
      return exec('git', ['push']);
    })
    .then(() => {
      console.log('[dlImg] Image downloaded and changes pushed successfully.');
    })
    .catch(error => {
      if (error.code === 1 && error.outputData && error.outputData.includes('nothing to commit')) {
        console.log('[dlImg] No changes to commit.');
      } else {
        console.error('[dlImg] Error:', error.outputData || error.message);
      }
    });
}

console.log('[main] Starting badge workflow...');
dlImg(
  GITHUB_TOKEN, 
  FILEPATH, 
  THM_USERNAME, 
  USE_STATIC_IMAGE, 
  USER_PUBLIC_ID
)
