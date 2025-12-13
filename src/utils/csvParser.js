/**
 * Parser for CSV leads file
 * Format: UEI,CAGE_CODE,STATUS,INITIAL_REG_DATE,EXPIRATION_DATE,LAST_UPDATE_DATE,LEGAL_BUSINESS_NAME,CITY,STATE,ZIP,POC_FIRST_NAME,POC_LAST_NAME
 */

export function parseCSVLeadsFile(fileContent) {
  const leads = [];
  const lines = fileContent.split('\n').filter(line => line.trim());

  // Skip header row
  const dataLines = lines.slice(1);

  dataLines.forEach(line => {
    // Parse CSV line (handles commas in quoted fields)
    const fields = parseCSVLine(line);

    if (fields.length < 12) {
      console.warn('Skipping invalid line (expected 12 fields):', line);
      return;
    }

    const [
      uei,
      cageCode,
      status,
      initialRegDate,
      expirationDate,
      lastUpdateDate,
      legalBusinessName,
      city,
      state,
      zip,
      pocFirstName,
      pocLastName
    ] = fields;

    // Skip if no UEI or business name
    if (!uei || !legalBusinessName) {
      return;
    }

    // Combine POC first and last name
    const pocName = `${pocFirstName.trim()} ${pocLastName.trim()}`.trim();

    const lead = {
      id: generateLeadId(),
      company: legalBusinessName.trim(),
      uei: uei.trim(),
      pocName: pocName, // Now extracted from CSV!
      initialEntityDate: formatDate(initialRegDate),
      recentActivationDate: formatDate(lastUpdateDate),
      address: `${city}, ${state} ${zip}`.trim(),
      naicsCount: '', // Not in CSV
      naicsCodes: '', // Not in CSV

      // CSV-specific fields
      cageCode: cageCode.trim(),
      status: status.trim(),
      expirationDate: formatDate(expirationDate),
      city: city.trim(),
      state: state.trim(),
      zip: zip.trim(),

      // Contact info to be added manually
      phone: '',
      email: '',

      // Tracking fields
      callHistory: [],
      notes: '',
      status: 'new',
      lastContactDate: null,

      // SOURCE TAG - This identifies fresh leads!
      source: 'fresh',

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    leads.push(lead);
  });

  return leads;
}

/**
 * Parse a CSV line handling quoted fields with commas
 */
function parseCSVLine(line) {
  const fields = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // Add last field
  fields.push(currentField);

  return fields;
}

/**
 * Format date from YYYYMMDD to YYYY-MM-DD
 */
function formatDate(dateStr) {
  if (!dateStr || dateStr.length !== 8) {
    return dateStr;
  }

  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);

  return `${year}-${month}-${day}`;
}

/**
 * Generate unique lead ID
 */
function generateLeadId() {
  return `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
