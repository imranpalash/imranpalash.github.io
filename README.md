# Portfolio site: publish on GitHub Pages at imranhasnat.com

## 1. Put the site on GitHub
1. Sign in at github.com. Create a new public repository named exactly `YOUR-USERNAME.github.io`.
2. On the repository page, click "uploading an existing file". Drag in everything from this folder: `index.html`, `CNAME`, `assets`, and `race-to-refuge`. Click "Commit changes".
3. Open Settings, then Pages. Under "Build and deployment", set Source to "Deploy from a branch", branch `main`, folder `/ (root)`. Save.

## 2. Point imranhasnat.com to GitHub (at your domain registrar's DNS settings)
Delete any existing A or CNAME records for `@` and `www`, then add:

| Type  | Host / Name | Value                    |
|-------|-------------|--------------------------|
| A     | @           | 185.199.108.153          |
| A     | @           | 185.199.109.153          |
| A     | @           | 185.199.110.153          |
| A     | @           | 185.199.111.153          |
| CNAME | www         | YOUR-USERNAME.github.io  |

## 3. Finish in GitHub
1. In Settings, Pages, the Custom domain box should show `imranhasnat.com` (the CNAME file sets it). If not, type it and Save.
2. Wait until the DNS check passes (a few minutes to a few hours), then tick "Enforce HTTPS".
3. Test: https://imranhasnat.com and https://imranhasnat.com/race-to-refuge/

To add a piece later, copy the TEMPLATE block in `index.html`, fill it in, put its image in `assets`, and upload the changed files the same way.
