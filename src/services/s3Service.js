import AWS from 'aws-sdk';

// Configure AWS SDK
// These will be set from environment variables
const s3 = new AWS.S3({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.REACT_APP_S3_BUCKET_NAME;
const LEADS_FILE_KEY = 'leads-data.json';

/**
 * Fetch leads data from S3
 */
export async function fetchLeadsFromS3() {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: LEADS_FILE_KEY
    };

    const data = await s3.getObject(params).promise();
    const leadsData = JSON.parse(data.Body.toString('utf-8'));
    return leadsData;
  } catch (error) {
    if (error.code === 'NoSuchKey') {
      // File doesn't exist yet, return empty array
      console.log('No leads file found, returning empty array');
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
    const params = {
      Bucket: BUCKET_NAME,
      Key: LEADS_FILE_KEY,
      Body: JSON.stringify(leads, null, 2),
      ContentType: 'application/json'
    };

    await s3.putObject(params).promise();
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

    const params = {
      Bucket: BUCKET_NAME,
      Key: `backups/leads-backup-${timestamp}.json`,
      Body: JSON.stringify(leads, null, 2),
      ContentType: 'application/json'
    };

    await s3.putObject(params).promise();
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
    await s3.headBucket({ Bucket: BUCKET_NAME }).promise();
    return true;
  } catch (error) {
    console.error('S3 connection test failed:', error);
    return false;
  }
}
