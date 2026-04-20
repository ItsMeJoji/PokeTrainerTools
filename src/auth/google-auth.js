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
  try {
    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    console.log('GAPI client initialized');
  } catch (err) {
    console.error('GAPI client initialization failed:', err);
  }
}

/**
 * Initializes Google Identity Services (GIS).
 */
function initializeGisClient() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '', // defined at request time
    itp_support: true,
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
    gapiScript.async = true;
    gapiScript.defer = true;
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
    gisScript.async = true;
    gisScript.defer = true;
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
 * Trigger OAuth2 flow to get a token via Popup.
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
 * Trigger OAuth2 flow via Redirect (useful for environments with strict COOP).
 * @param {string} state - State to pass through the redirect.
 */
export function signInRedirect(state = '') {
  if (!CLIENT_ID) {
    console.error('Missing VITE_GOOGLE_CLIENT_ID environment variable.');
    alert('Configuration Error: Google Client ID is missing. Please check your production environment variables.');
    return;
  }
  
  // Temporary debug alert
  alert('Debug Client ID: [[' + CLIENT_ID + ']]');

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: window.location.origin + '/',
    response_type: 'token',
    scope: SCOPES,
    include_granted_scopes: 'true',
    state: state
  });

  window.location.assign(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}

/**
 * Parses and handles the OAuth redirect callback from the URL hash.
 * @returns {string|null} The state passed during signInRedirect if successful.
 */
export function handleRedirectCallback() {
  const hash = window.location.hash;
  if (!hash || !hash.includes('access_token')) return null;

  // URLSearchParams doesn't handle '#' at the start, remove it
  const fragment = new URLSearchParams(hash.substring(1));
  const token = fragment.get('access_token');
  const state = fragment.get('state');

  if (token) {
    gapi.client.setToken({ access_token: token });
    console.log('Token recovered from redirect');
    
    // Clean up the URL hash without triggering a load
    window.history.replaceState(null, null, window.location.pathname + window.location.search);
    return state;
  }

  return null;
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
