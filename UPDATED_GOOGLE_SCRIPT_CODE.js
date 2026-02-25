/**
 * Shake On - Pledge Form Handler with reCAPTCHA Enterprise Verification
 * 
 * SETUP: Add your reCAPTCHA API key to Script Properties:
 * 1. In Apps Script editor: Project Settings (gear icon) > Script Properties
 * 2. Add property: RECAPTCHA_API_KEY = your API key from Google Cloud Console
 * 3. Get API key from: APIs & Services > Credentials > Create Credentials > API Key
 *    (Ensure reCAPTCHA Enterprise API is enabled for your project)
 */

const PROJECT_ID = 'my-project-3317-1769289470923';
const SITE_KEY = '6Ld_SVUsAAAAAKIQpaytI8PJ76qAqmPHHakAgxPy';
const SHEET_ID = '1EIfU6bG-Y6wTdWPIk5_lBOmW9afsIGKAPrK7J04u4cM';

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'API is ready'
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // 1. Verify reCAPTCHA token before processing
    const recaptchaToken = data.recaptcha;
    if (!recaptchaToken) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Missing reCAPTCHA token'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const verificationResult = verifyRecaptchaToken(recaptchaToken, e);
    if (!verificationResult.valid) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: verificationResult.error || 'reCAPTCHA verification failed'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. Get IP address from request
    let ipAddress = 'Unknown';
    try {
      const headers = e.parameter || {};
      ipAddress = headers.ip || 'Unknown';
    } catch (ipError) {
      ipAddress = 'Unknown';
    }
    
    // 3. Append to sheet
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    sheet.appendRow([
      data.timestamp || new Date(),
      data.name,
      data.email,
      data.pledgeAmount || '',
      data.dedication || '',
      ipAddress
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

/**
 * Verify reCAPTCHA token via reCAPTCHA Enterprise API
 * @param {string} token - Token from grecaptcha.getResponse() or grecaptcha.enterprise.execute()
 * @param {Object} requestEvent - The doPost event (for optional userAgent, userIpAddress)
 * @returns {{valid: boolean, error?: string}}
 */
function verifyRecaptchaToken(token, requestEvent) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('RECAPTCHA_API_KEY');
  if (!apiKey) {
    Logger.log('RECAPTCHA_API_KEY not set in Script Properties');
    return { valid: false, error: 'Server configuration error' };
  }
  
  const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${PROJECT_ID}/assessments?key=${apiKey}`;
  
  const requestBody = {
    event: {
      token: token,
      siteKey: SITE_KEY
    }
  };
  
  // Add optional fields if available (improves detection)
  try {
    const params = requestEvent.parameter || {};
    if (params.userAgent) requestBody.event.userAgent = params.userAgent;
    if (params.userIpAddress) requestBody.event.userIpAddress = params.userIpAddress;
  } catch (e) {}
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(requestBody),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseBody = JSON.parse(response.getContentText());
    
    if (responseCode !== 200) {
      Logger.log('reCAPTCHA API error: ' + response.getContentText());
      return { valid: false, error: 'Verification service error' };
    }
    
    const tokenValid = responseBody.tokenProperties && responseBody.tokenProperties.valid === true;
    
    if (!tokenValid) {
      const invalidReason = responseBody.tokenProperties?.invalidReason || 'Token invalid';
      Logger.log('reCAPTCHA token invalid: ' + invalidReason);
      return { valid: false, error: 'Verification failed' };
    }
    
    // Optional: Check risk score for reCAPTCHA v3 (0.0 = bot, 1.0 = human)
    if (responseBody.riskAnalysis && responseBody.riskAnalysis.score !== undefined) {
      const score = responseBody.riskAnalysis.score;
      if (score < 0.5) {
        Logger.log('reCAPTCHA risk score too low: ' + score);
        return { valid: false, error: 'Verification failed' };
      }
    }
    
    return { valid: true };
    
  } catch (error) {
    Logger.log('reCAPTCHA verification exception: ' + error.toString());
    return { valid: false, error: 'Verification service unavailable' };
  }
}

// Test function (optional - does not include reCAPTCHA, will fail verification)
function test() {
  const testData = {
    timestamp: new Date().toISOString(),
    name: 'Test User',
    email: 'test@example.com',
    pledgeAmount: '$20',
    dedication: 'Test message',
    recaptcha: 'invalid_test_token'
  };
  
  const mockEvent = {
    postData: { contents: JSON.stringify(testData) },
    parameter: {}
  };
  
  doPost(mockEvent);
}
