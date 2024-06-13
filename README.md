tryhackme-workflow
==================

*A simple github action to retrieve tryhackme static badge image and display it on your profile README!*

![profile_demo](https://raw.githubusercontent.com/p4p1/tryhackme-workflow/main/assets/public_profile.png)

[How This Was Built](https://leosmith.wtf/blog/github-tryhackme-action.html)

## How to use:

1. Star this repo and give me a follow :)
2. Create a .github/workflows directory in your username repo where your README is located
3. Create a file named tryhackme-badge-workflow.yml inside of that folder
4. Place the following code inside of the previously created file:
```yaml
name: TryHackMe Update Badge

on:
  schedule:
    # Make it run every 24 hour
    - cron: '0 0 * * *'
  workflow_dispatch:
jobs:
  tryhackme-badge-update:
    name: Update this repo's tryhackme badge with the latest tryhackme image badge
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: p4p1/tryhackme-badge-workflow@main
        with:
          # Replace with your tryhackme username
          username: "<USERNAME>"
          GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}} # Do not paste your github token here - this is a placeholder
                                                  # and will pull your github token automatically
```
5. Create a assets/ folder inside of your username repo
6. Add the following markdown in your read me and add your username:
```markdown
![tryhackme stats](https://raw.githubusercontent.com/<SET_USERNAME_HERE>/<SET_USERNAME_HERE>/master/assets/thm_propic.png)
```
7. Run the action

## Variables:
name               | description                               | default                   | required
------------------ | ----------------------------------------- | ------------------------- | --------
image_path         | Path of the image file you want to update | ./assets/thm_propic.png   | false
username           | Tryhackme username                        |                           | true
committer_username | Username of commiting bot                 | thm-p4p1-bot              | false
committer_email    | Email of commiting bot                    | p4p1@thm.bot              | false
commit_message     | Commit message                            | Updated THM profile badge | false
GITHUB_TOKEN       | Your github secret token                  |                           | true
