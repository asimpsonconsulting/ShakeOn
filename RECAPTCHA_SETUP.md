# reCAPTCHA Enterprise Verification Setup

The Google Apps Script now verifies reCAPTCHA tokens before saving pledges. Follow these steps to complete setup.

## 1. Enable reCAPTCHA Enterprise API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **my-project-3317-1769289470923**
3. Go to **APIs & Services** > **Library**
4. Search for **reCAPTCHA Enterprise API**
5. Click **Enable** if not already enabled

## 2. Create an API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy the API key
4. (Recommended) Click **Restrict Key** and restrict to:
   - **API restrictions**: Restrict to "reCAPTCHA Enterprise API"

## 3. Add API Key to Google Apps Script

1. Open your [Google Apps Script](https://script.google.com/) project for the Shake On pledge form
2. Click the **Project Settings** (gear icon) in the left sidebar
3. Under **Script Properties**, click **Add script property**
4. **Property**: `RECAPTCHA_API_KEY`
5. **Value**: Paste your API key from step 2
6. Click **Save**

## 4. Deploy the Updated Script

1. Copy the contents of `UPDATED_GOOGLE_SCRIPT_CODE.js` into your Apps Script editor
2. Replace the existing `doPost` and add the new `verifyRecaptchaToken` function
3. Click **Deploy** > **Manage deployments**
4. Edit the existing deployment and create a **New version**
5. Click **Deploy**

## 5. Verify Project ID (if needed)

If your Google Cloud project ID is different from `my-project-3317-1769289470923`, update the `PROJECT_ID` constant at the top of the script to match your project.

To find your project ID: Google Cloud Console > Project dropdown at top > Project ID is shown.

## How It Works

1. User completes the pledge form and reCAPTCHA
2. Form submits the reCAPTCHA token to your Apps Script
3. Apps Script sends the token to reCAPTCHA Enterprise API for verification
4. If `tokenProperties.valid` is true, the pledge is saved to the sheet
5. If verification fails, the pledge is rejected and an error is returned

## Troubleshooting

- **"Server configuration error"**: RECAPTCHA_API_KEY is not set in Script Properties
- **"Verification failed"**: Token may be expired (valid 2 min), already used, or invalid
- **API returns 403**: Ensure reCAPTCHA Enterprise API is enabled and the API key has access
