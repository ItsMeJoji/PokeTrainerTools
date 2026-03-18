/**
 * Google Identity Services (GIS) & GAPI Client Wrapper
 * Handles authentication and loading of Google Drive API.
 */

// Replace these with your actual keys from Google Cloud Console
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

// Authorization scopes required by the API
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';

let tokenClient;
let gapiInited = false;
let gisInited = false;

/**
 * Initializes the Google API client library.
 */
async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;
  console.log('GAPI client initialized');
}

/**
 * Initializes Google Identity Services (GIS).
 */
function initializeGisClient() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '', // defined at request time
  });
  gisInited = true;
  console.log('GIS client initialized');
}

/**
 * Main initialization call. Load both GAPI and GIS.
 */
export async function initGoogleAuth() {
  return new Promise((resolve) => {
    // Load GAPI
    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.onload = () => {
      gapi.load('client', async () => {
        await initializeGapiClient();
        checkReady();
      });
    };
    document.head.appendChild(gapiScript);

    // Load GIS
    const gisScript = document.createElement('script');
    gisScript.src = 'https://accounts.google.com/gsi/client';
    gisScript.onload = () => {
      initializeGisClient();
      checkReady();
    };
    document.head.appendChild(gisScript);

    function checkReady() {
      if (gapiInited && gisInited) resolve();
    }
  });
}

/**
 * Trigger OAuth2 flow to get a token.
 * @returns {Promise<string>} The access token.
 */
export async function signIn() {
  return new Promise((resolve, reject) => {
    tokenClient.callback = async (resp) => {
      if (resp.error !== undefined) {
        reject(resp);
      }
      resolve(resp.access_token);
    };

    if (gapi.client.getToken() === null) {
      // Prompt the user to select a Google Account and ask for consent to share their data
      // when establishing a new session.
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
}

/**
 * Sign out from Google.
 */
export function signOut() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken('');
  }
}

/**
 * Checks if a token is already available.
 */
export function isSignedIn() {
  return gapi.client.getToken() !== null;
}
