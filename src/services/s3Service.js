// Simple S3 service using public bucket access
// No authentication needed - bucket is publicly accessible
// WARNING: Anyone with the URL can read/write data!

const BUCKET_URL = process.env.REACT_APP_S3_BUCKET_URL;
const LEADS_FILE_KEY = 'leads-data.json';
const LEADS_URL = `${BUCKET_URL}/${LEADS_FILE_KEY}`;

/**
 * Fetch leads data from S3
 */
export async function fetchLeadsFromS3() {
  try {
    const response = await fetch(LEADS_URL, {
      method: 'GET',
      cache: 'no-cache'
    });

    if (response.status === 404) {
      // File doesn't exist yet, return empty array
      console.log('No leads file found, returning empty array');
      return [];
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const leadsData = await response.json();
    return leadsData;
  } catch (error) {
    if (error.message.includes('404')) {
      return [];
    }
    console.error('Error fetching leads from S3:', error);
    throw error;
  }
}

/**
 * Save leads data to S3
 */
export async function saveLeadsToS3(leads) {
  try {
    const response = await fetch(LEADS_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leads, null, 2)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('Leads saved to S3 successfully');
    return true;
  } catch (error) {
    console.error('Error saving leads to S3:', error);
    throw error;
  }
}

/**
 * Upload initial leads.txt file and convert to JSON
 */
export async function uploadInitialLeadsFile(fileContent, parser) {
  try {
    // Parse the text file
    const leads = parser(fileContent);

    // Save to S3
    await saveLeadsToS3(leads);

    return leads;
  } catch (error) {
    console.error('Error uploading initial leads file:', error);
    throw error;
  }
}

/**
 * Update a single lead
 */
export async function updateLead(updatedLead) {
  try {
    // Fetch all leads
    const leads = await fetchLeadsFromS3();

    // Find and update the lead
    const leadIndex = leads.findIndex(l => l.id === updatedLead.id);

    if (leadIndex === -1) {
      throw new Error('Lead not found');
    }

    leads[leadIndex] = {
      ...updatedLead,
      updatedAt: new Date().toISOString()
    };

    // Save back to S3
    await saveLeadsToS3(leads);

    return leads[leadIndex];
  } catch (error) {
    console.error('Error updating lead:', error);
    throw error;
  }
}

/**
 * Create backup of current leads data
 */
export async function createBackup() {
  try {
    const leads = await fetchLeadsFromS3();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupUrl = `${BUCKET_URL}/backups/leads-backup-${timestamp}.json`;

    const response = await fetch(backupUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leads, null, 2)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('Backup created successfully');
    return true;
  } catch (error) {
    console.error('Error creating backup:', error);
    throw error;
  }
}

/**
 * Check if S3 is properly configured
 */
export async function testS3Connection() {
  try {
    const response = await fetch(LEADS_URL, {
      method: 'HEAD'
    });
    return response.ok || response.status === 404; // 404 is ok, means bucket exists but file doesn't
  } catch (error) {
    console.error('S3 connection test failed:', error);
    return false;
  }
}
