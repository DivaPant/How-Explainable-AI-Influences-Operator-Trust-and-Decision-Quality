# Deployment and collection setup (non-programmer guide)

This is a static GitHub Pages participant app plus an optional Google Apps Script receiver. No server you operate is required. Read the privacy and key-protection notes before publishing.

## Files to upload to the GitHub Pages repository

Upload these files into the repository root:

- `index.html`
- `styles.css`
- `app.js`
- `stats.js`
- `scenarios.json`
- `scenarios-local.js`
- `config.js`
- `ethics.html`
- `participant-information-sheet.pdf`

Do **not** upload the sibling researcher kit (`../xai-study-researcher-kit/`), answer key, Apps Script source, or any participant data to a public GitHub repository. GitHub Pages sites are public. The files in `scenarios.json` contain participant-facing stimuli; ground-truth keys are maintained in the private researcher kit and private spreadsheet. Practice feedback keys are included in the participant app for training only.

## Step 1 - Create a GitHub repository

Sign in to GitHub, choose **New repository**, give it a name, and create it. A public repository is sufficient for GitHub Free Pages. Do not include participant data or the researcher kit.

## Step 2 - Upload the site files

Open the repository, choose **Add file → Upload files**, and upload only the public files listed above. Commit them to the `main` branch.

## Step 3 - Enable GitHub Pages

In the repository, open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/(root)`, then **Save**. Wait for the Pages build to finish. The participant link will look like `https://USERNAME.github.io/REPOSITORY/`. GitHub's current guide describes publishing from a branch and warns that Pages sites are public: [GitHub Pages publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Step 4 - Create the private Google Sheet

Create a Google Sheet owned by the research team. Keep its sharing set to restricted and grant access only to authorised researchers. Add a tab named `GroundTruth`; import `ground_truth_master.csv` from the private researcher kit into that tab, replacing the starter header if prompted. Confirm the first row is the CSV header row. Keep this tab private; do not publish or share it with participants.

## Step 5 - Add and deploy Apps Script

In the Sheet, choose **Extensions → Apps Script**. Replace the editor contents with `google-apps-script.js` from the sibling `../xai-study-researcher-kit/` and save. Choose **Deploy → New deployment → Web app**. Set **Execute as** to your account and **Who has access** to **Anyone** (or the closest option your institution permits). Authorise access. Copy the deployed URL ending `/exec`.

The public endpoint is necessary for an unauthenticated participant website to submit records. Anyone who obtains the URL may submit data; the script validates submissions and flags anomalies but this is not strong authentication or abuse protection. Do not collect special-category or highly sensitive information with this setup. The researcher-owned Sheet itself should remain private. Apps Script has quotas and limits that may change; review Google's current [web app guide](https://developers.google.com/apps-script/guides/web) and [quotas](https://developers.google.com/apps-script/guides/services/quotas).

## Step 6 - Configure the endpoint

In `config.js`, set the endpoint and enable remote submission:

```js
window.STUDY_CONFIG = Object.freeze({
  SHEET_ENDPOINT: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',
  SCENARIOS_PATH: 'scenarios.json',
  STUDY_VERSION: 'within-sub-v2.1',
  REMOTE_COLLECTION_ENABLED: true
});
```

The participant page sends a simple `text/plain` JSON POST in `no-cors` mode. Browsers do not expose the Apps Script response to the page, so the completion screen can say the request was sent but cannot prove that it was written. Verify a test record in the Sheet before recruitment. If a submission is missing, use the locally retained record and participant session ID to investigate.

## Step 7 - Commit the endpoint setting

Upload or edit `config.js` in GitHub and commit. The Apps Script URL is not a password; it is a public endpoint. Do not put a researcher password or private key into public JavaScript.

## Step 8 - Test before recruitment

Open the Pages URL in a modern browser and complete a clearly marked test run. Confirm one aggregate row, 30 scenario rows, and audit rows arrive in the Sheet. Check columns, condition order, consent timestamp, completion duration, quality flags, and scoring against the private ground truth. Delete the test rows after verification. Check the Sheet is not publicly shared. Confirm the ethics and privacy page contains no bracketed placeholders.

## Step 9 - Researcher dashboard and exports

Keep the private researcher kit outside the public Pages repository. Open `researcher.html` locally in a browser. Download the `ParticipantSessions` and `ScenarioResponses` tabs as CSV from the private Sheet and load them into the dashboard. It provides summary charts and cleaned exports that exclude duplicate or failed-quality records. A separate **Download ground-truth master CSV** button is provided in this researcher-only local kit. The dashboard is not secure access control; keep the kit and downloaded files in an approved restricted location.

## Submission and duplicates

Each completed run has a random session UUID. Participant codes are optional; when a researcher supplies a code, the app validates allowed characters and warns on repeats in that browser. Apps Script detects an already-seen session ID and avoids appending it twice. Reuse of a participant code across different devices is marked `suspectedDuplicate=true` and `dataQualityFlag=WARNING`; it is not silently rejected because this no-login workflow cannot establish whether it is a legitimate retake. `FAIL` records are retained for audit but excluded from the cleaned dataset. Investigators should define exclusion rules before collection.

## Important study / privacy notes

- This remains the requested three-condition within-participant study. Deployment does not change the design.
- The study owner must complete institution, controller, lawful-basis, contact, retention, withdrawal, DPO, transfer, compensation, and ethics-review details in `ethics.html` and the PDF before recruitment. GDPR Article 13 requires information such as controller identity, purpose/lawful basis, recipients, retention, rights, and complaint route; see [GDPR Article 13](https://eur-lex.europa.eu/eli/reg/2016/679).
- Google Sheets and GitHub are third-party services. Review institutional approval, service terms, storage location, access control, and any transfer safeguards. The prototype does not itself store IP addresses, but the hosting and network services can process technical connection data.
- Browser local storage is unencrypted. Data in an interrupted run remain only in memory and are lost if the page is closed before completion. Completed records are stored locally before remote send.
- The browser cannot know with certainty whether Google Sheets committed a `no-cors` submission. Always verify a pilot record before recruiting.
- A static GitHub Pages app cannot keep a key truly secret. Main-study ground truth is excluded from public participant files and held in the researcher-only Google Sheet; scoring occurs in Apps Script. Never put the answer-key CSV or private researcher portal in the Pages repository.
