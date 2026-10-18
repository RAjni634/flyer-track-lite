# Step-by-step guide (about 30 minutes, A$0)

You need only a web browser and a free GitHub account.

## Step 1 – Create a GitHub account
Go to <https://github.com/signup> and sign up. No credit card.

## Step 2 – Create a repository
1. Click **New repository**.
2. Name: `flyertrack-lite`. Choose **Public**. Don't tick "Add a README".
3. Click **Create repository**.

## Step 3 – Upload the project
1. Unzip `flyertrack-lite.zip` on your computer.
2. On the empty repository page click **uploading an existing file**.
3. Open the unzipped folder and drag **everything inside it** (the `docs`, `architecture`, `tools`, `terraform` folders plus `README.md`, `LICENSE`, `.gitignore`) into the browser.
   - Folders keep their structure when dragged. Make sure `docs/.nojekyll` is included; if your computer hides files starting with a dot, skip it, the site still works.
4. Scroll down and click **Commit changes**.

✅ **Check:** the repository page shows the folders and the README with the diagram.

## Step 4 – Turn on GitHub Pages (this makes it live)
1. In your repository click **Settings** → **Pages** (left menu).
2. Under **Build and deployment** set **Source: Deploy from a branch**.
3. Branch: **main**, folder: **/docs**, click **Save**.
4. Wait 1–2 minutes and refresh the Pages screen. A banner shows your site address, like `https://YOUR-USERNAME.github.io/flyertrack-lite/`.

✅ **Check:** open the address. You see the map with a side panel.

## Step 5 – Try the demo
1. Click **Load sample walk**. A green trail replays through a zone in Sydney and the coverage percentage rises (the sample ends around 55%).
2. Click **Reset everything**, then **Draw zone**, click 3 or more points around your street, and click **Finish zone**.
3. On your phone open the same address, press **Start GPS**, allow location, and walk. Your coverage rises as you go.

**If it fails**
- *404 page:* Pages can take a few minutes the first time. Also confirm the folder is `/docs`.
- *Blank map:* check you are online; map tiles load from OpenStreetMap.
- *GPS does nothing:* allow location for the site in your browser settings. GPS only works over HTTPS, which GitHub Pages provides.

## Step 6 – Personalise the project
1. In the repo, open `README.md` → pencil icon → replace `_add your GitHub Pages URL here_` with your real address. Commit.
2. Open `docs/index.html` → pencil icon → change `https://github.com/` in the "About this project" link to your repository address. Commit.
3. Open `LICENSE` and replace `YOUR NAME`.

## Step 7 – Capture portfolio evidence
- Screenshot the demo showing the coverage percentage.
- Export the README diagram as an image at <https://mermaid.live> and save screenshots in a folder called `images/` (use **Add file → Upload files**).
- Pin the repository on your GitHub profile and add the link to your CV and LinkedIn.

## Step 8 (optional) – Regenerate the sample data with Python
Install Python 3 from python.org, then in a terminal in the project folder:
```bash
python3 tools/generate_sample_walk.py     # Windows: python tools/generate_sample_walk.py
```
Change `ROWS` or the `0.7` in that file to get a different coverage, then upload the new `docs/sample-walk.json`.

## Step 9 (optional) – Check the Terraform design
The `terraform/` folder describes the Azure resources as code. You never deploy it, so it costs nothing and needs no Azure account.
```bash
cd terraform
terraform init -backend=false
terraform validate
```
`Success! The configuration is valid.` proves the design is syntactically correct. **Do not run `terraform apply`.**

## What to say in an interview
"I designed the platform on Azure, documented the decisions and costs, proved the core idea with a free working prototype, and wrote the infrastructure as Terraform. I deliberately did not deploy it to keep cost at zero." Then walk through [01-target-architecture.md](01-target-architecture.md).
