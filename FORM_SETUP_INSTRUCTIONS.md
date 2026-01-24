# Pledge Form Setup Instructions

This guide will help you set up the Google Apps Script backend and reCAPTCHA for the pledge form.

## Step 1: Set Up Google Sheets

1. Create a new Google Sheet: https://sheets.google.com
2. Name it "Shake On Pledges" (or your preferred name)
3. In the first row, add these column headers:
   - Column A: `Timestamp`
   - Column B: `Name`
   - Column C: `Email`
   - Column D: `Pledge Amount`
   - Column E: `Dedication Message`
   - Column F: `IP Address`

## Step 2: Create Google Apps Script

1. Go to: https://script.google.com
2. Click "New Project"
3. Replace the default code with this:

```javascript
function doPost(e) {
  try {
    // Parse the JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Get your Google Sheet ID (found in the URL)
    const SHEET_ID = 'YOUR_SHEET_ID_HERE';
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    
    // Get IP address (if available)
    const ipAddress = e.parameter.ip || 'Unknown';
    
    // Append the data to the sheet
    sheet.appendRow([
      data.timestamp || new Date(),
      data.name,
      data.email,
      data.pledgeAmount || '',
      data.dedication || '',
      ipAddress
    ]);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Pledge submitted successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function (optional)
function test() {
  const testData = {
    timestamp: new Date().toISOString(),
    name: 'Test User',
    email: 'test@example.com',
    pledgeAmount: '$20',
    dedication: 'Test message'
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    },
    parameter: {
      ip: '127.0.0.1'
    }
  };
  
  doPost(mockEvent);
}
```

4. **Replace `YOUR_SHEET_ID_HERE`** with your actual Google Sheet ID:
   - The Sheet ID is in the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
   - Copy the part between `/d/` and `/edit`

5. Save the script (Ctrl+S or Cmd+S)
6. Name it "Shake On Form Handler"

## Step 3: Deploy as Web App

1. Click "Deploy" → "New deployment"
2. Click the gear icon ⚙️ next to "Select type" → Choose "Web app"
3. Set:
   - Description: "Shake On Pledge Form Handler"
   - Execute as: "Me"
   - Who has access: "Anyone"
4. Click "Deploy"
5. **Copy the Web App URL** - you'll need this for the next step
6. Click "Authorize access" and grant permissions

## Step 4: Set Up reCAPTCHA

1. Go to: https://www.google.com/recaptcha/admin/create
2. Fill in:
   - Label: "Shake On Pledge Form"
   - reCAPTCHA type: **reCAPTCHA v2** → "I'm not a robot" Checkbox
   - Domains: Add your domain (e.g., `shakeon.org`, `www.shakeon.org`)
3. Accept the terms and submit
4. **Copy your Site Key** and **Secret Key**

## Step 5: Update Your Website

1. Open `index.html`
2. Find this line (around line 1037):
   ```html
   <div class="g-recaptcha" data-sitekey="YOUR_RECAPTCHA_SITE_KEY"></div>
   ```
   Replace `YOUR_RECAPTCHA_SITE_KEY` with your reCAPTCHA Site Key

3. Find this line (around line 1042):
   ```javascript
   const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   ```
   Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with your Google Apps Script Web App URL

## Step 6: Verify Server-Side reCAPTCHA (Optional but Recommended)

Update your Google Apps Script to verify reCAPTCHA on the server side:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Verify reCAPTCHA
    const recaptchaSecret = 'YOUR_RECAPTCHA_SECRET_KEY';
    const recaptchaResponse = data.recaptcha;
    
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaResponse}`;
    const verifyResponse = UrlFetchApp.fetch(verifyUrl);
    const verifyResult = JSON.parse(verifyResponse.getContentText());
    
    if (!verifyResult.success) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'reCAPTCHA verification failed'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Continue with saving to sheet...
    const SHEET_ID = 'YOUR_SHEET_ID_HERE';
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    
    sheet.appendRow([
      data.timestamp || new Date(),
      data.name,
      data.email,
      data.pledgeAmount || '',
      data.dedication || '',
      e.parameter.ip || 'Unknown'
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Pledge submitted successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

Replace `YOUR_RECAPTCHA_SECRET_KEY` with your reCAPTCHA Secret Key.

## Testing

1. Test the form by clicking "Match my pledge"
2. Fill out the form and submit
3. Check your Google Sheet - you should see the new entry
4. Test reCAPTCHA by trying to submit without checking the box

## Troubleshooting

- **Form not submitting**: Check browser console (F12) for errors
- **Data not appearing in sheet**: Verify Sheet ID is correct in the script
- **reCAPTCHA not showing**: Check Site Key is correct and domain is added
- **CORS errors**: This is normal with `no-cors` mode - the form will still work

## Alternative: Using Formspree (Easier Option)

If you prefer a simpler setup without Google Apps Script:

1. Sign up at: https://formspree.io
2. Create a new form
3. Get your form endpoint URL
4. Update the `GOOGLE_SCRIPT_URL` in `index.html` to your Formspree URL
5. Formspree can forward submissions to your email or Google Sheets

Note: Formspree free plan has limitations. Paid plans ($10/month) include Google Sheets integration.
