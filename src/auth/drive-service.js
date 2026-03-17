/**
 * Google Drive API Service
 * Handles CRUD operations for the ribbon data file in the appDataFolder.
 */

const FILE_NAME = 'ribbon_data.json';

/**
 * Finds the ribbon_data.json file in the appDataFolder.
 * @returns {Promise<string|null>} The file ID or null if not found.
 */
export async function findAppDataFile() {
  try {
    const response = await gapi.client.drive.files.list({
      spaces: 'appDataFolder',
      fields: 'files(id, name)',
      pageSize: 10,
    });
    
    const files = response.result.files;
    const file = files.find(f => f.name === FILE_NAME);
    return file ? file.id : null;
  } catch (err) {
    console.error('Error finding app data file:', err);
    throw err;
  }
}

/**
 * Loads the content of the ribbon data file.
 * @param {string} fileId - The ID of the file to load.
 * @returns {Promise<any>} The parsed JSON content.
 */
export async function loadFromCloud(fileId) {
  try {
    const response = await gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media',
    });
    return response.result;
  } catch (err) {
    console.error('Error loading from cloud:', err);
    throw err;
  }
}

/**
 * Saves (creates or updates) the ribbon data to the cloud.
 * @param {any} data - The data object to save.
 * @param {string|null} fileId - The existing file ID, or null to create a new one.
 */
export async function saveToCloud(data, fileId = null) {
  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  const contentType = 'application/json';
  const metadata = {
    'name': FILE_NAME,
    'mimeType': contentType,
  };

  if (!fileId) {
    metadata.parents = ['appDataFolder'];
  }

  const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: ' + contentType + '\r\n\r\n' +
      JSON.stringify(data) +
      close_delim;

  try {
    const request = gapi.client.request({
      'path': fileId ? `/upload/drive/v3/files/${fileId}` : '/upload/drive/v3/files',
      'method': fileId ? 'PATCH' : 'POST',
      'params': {'uploadType': 'multipart'},
      'headers': {
        'Content-Type': 'multipart/related; boundary="' + boundary + '"'
      },
      'body': multipartRequestBody
    });
    
    const response = await request;
    return response.result;
  } catch (err) {
    console.error('Error saving to cloud:', err);
    throw err;
  }
}
