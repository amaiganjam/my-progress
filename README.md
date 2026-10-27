# My Progress

A mobile-first installable PWA with exactly three tabs: Quit Smoking, Quit Drinking, Quit Weed. No build tools, dependencies, accounts, analytics, or backend. All runtime assets are included.

## Run on a computer

1. Extract the ZIP.
2. Open Terminal in the `my-progress` folder.
3. Run `python3 -m http.server 8000` (requires Python 3).
4. Open http://localhost:8000 in a browser.

Do not double-click index.html for installation: service workers need HTTPS or localhost. A computer's localhost URL does not reach that computer from an iPhone.

## Put it online for your iPhone — GitHub Pages

A hosting account is only for deployment; the app itself never requires an account.

1. Sign in at https://github.com and create a public repository named `my-progress`. GitHub Free supports Pages from public repositories.
2. In that repository, choose **Add file → Upload files**. Upload the CONTENTS of the extracted `my-progress` folder, so `index.html` is at the repository root. Commit the files. Include all three PNG icons, app.js, styles.css, sw.js, and manifest.webmanifest. There is no build step.
3. Open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, then branch **main** and folder **/(root)**. Save.
4. Wait for publication (may take about 10 minutes). Use **Visit site** on that page. The address is normally `https://YOUR-USERNAME.github.io/my-progress/`.
5. Open that HTTPS address in Safari on your iPhone.

Your app code is publicly accessible on this hosting option. Personal dates are never included in these files or sent to the host; each visitor gets their own local storage. Use a stable URL: a different host has separate data.

Official GitHub instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site and https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Install on iPhone

1. Open the published HTTPS URL in **Safari**.
2. Open **Share** (depending on Safari layout, first open the page menu).
3. Choose **Add to Home Screen**. If missing, use **Edit Actions** in the share sheet to add it.
4. Leave **Open as Web App** switched on if shown. Name it **My Progress**, then tap **Add**.
5. Launch **My Progress from its Home Screen icon**, then enter your dates there. Safari and the installed app may have separate storage; set dates in the installed app you intend to use.
6. While online, leave the app open briefly on first launch so its offline assets can cache. Close it, enable Airplane Mode, and reopen it to verify offline use on your device.

Apple's official guide: https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios

## Use

Choose a tab → **Set last-use date** → choose the local date/time → save. Each tab has its own date. To restart after using again, choose **Edit / reset last-use date**, select a date or **Use right now**, and save. Cancel or Escape leaves the date unchanged. The timer updates every second and recalculates immediately after returning to the app; days are elapsed 24-hour periods, followed by remaining hours and minutes. It does not need to run in the background. Dates are stored as absolute timestamps and displayed in your current local time zone.

## Local data

Dates and the selected tab are kept in localStorage across ordinary launches. No cross-device sync or automatic backup. Clearing website data, removing the app, private browsing restrictions, or the browser/OS reclaiming storage can erase dates. Keep a separate note of important dates. No data leaves this app, but the static host receives normal page requests. Device clock changes affect elapsed time.

## Updating

Replace the hosted files and change the CACHE version in sw.js when editing app assets. Reopen online, then close and reopen the app after the new service worker installs. Storage uses a separate key and is retained during normal updates.

## Verification performed

- JavaScript syntax checks for app.js and sw.js.
- Automated checks: day/hour/minute arithmetic, independent dates for all three tabs, storage reload, future-date rejection, manifest/icon references.
- In-app browser: initial state, date editor, use-right-now/save, separate unset tracker, selection and saved-date persistence after reload.
- Offline browser reload with local HTTP server stopped; timer continued advancing.
- Visual inspection of the app card and controls.
- Physical iPhone installation and device-specific storage/offline behavior still need the steps above.
