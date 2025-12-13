/**
 * Parser for leads.txt file
 * Parses the formatted lead data into structured JSON objects
 */

export function parseLeadsFile(fileContent) {
  const leads = [];

  // Split by the header pattern to get individual leads
  const leadPattern = /⭐ Qualified Lead:/g;
  const matches = [...fileContent.matchAll(leadPattern)];

  matches.forEach((match, index) => {
    const startIndex = match.index;
    const endIndex = index < matches.length - 1 ? matches[index + 1].index : fileContent.length;
    const leadBlock = fileContent.substring(startIndex, endIndex);

    const lead = {
      id: generateLeadId(),
      company: extractValue(leadBlock, '⭐ Qualified Lead:', ['=', '🆔', '\n\n']),
      uei: extractValue(leadBlock, '**UEI:**', ['\n', '👤']),
      pocName: extractValue(leadBlock, '**POC Name:**', ['\n', '📅']),
      initialEntityDate: extractValue(leadBlock, '**Initial Entity Date (2-Year Filter):**', ['\n', '✅']),
      recentActivationDate: extractValue(leadBlock, '**Recent Activation Date (3-Month Filter):**', ['\n', '📍']),
      address: extractValue(leadBlock, '**Address:**', ['\n', '🏭']),
      naicsCount: extractValue(leadBlock, '**NAICS Count:**', ['\n', '💡']),
      naicsCodes: extractValue(leadBlock, '**NAICS Codes:**', ['\n', '=']),

      // Contact info to be added manually
      phone: '',
      email: '',

      // Tracking fields
      callHistory: [],
      notes: '',
      status: 'new', // new, contacted, qualified, unqualified
      lastContactDate: null,

      // SOURCE TAG - Original leads from .txt file
      source: 'original',

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    leads.push(lead);
  });

  return leads;
}

/**
 * Extract field value - find text after pattern until any of the stop patterns
 */
function extractValue(text, startPattern, stopPatterns) {
  const startIndex = text.indexOf(startPattern);
  if (startIndex === -1) return '';

  const valueStart = startIndex + startPattern.length;
  let valueEnd = text.length;

  // Find the earliest stop pattern
  for (const stopPattern of stopPatterns) {
    const stopIndex = text.indexOf(stopPattern, valueStart);
    if (stopIndex !== -1 && stopIndex < valueEnd) {
      valueEnd = stopIndex;
    }
  }

  return text.substring(valueStart, valueEnd).trim();
}

/**
 * Generate unique lead ID
 */
function generateLeadId() {
  return `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Convert leads array back to formatted text for backup
 */
export function leadsToText(leads) {
  return leads.map(lead => {
    return `========================================================
⭐ Qualified Lead: ${lead.company}
========================================================
🆔 **UEI:** ${lead.uei}
👤 **POC Name:** ${lead.pocName}
📅 **Initial Entity Date (2-Year Filter):** ${lead.initialEntityDate}
✅ **Recent Activation Date (3-Month Filter):** ${lead.recentActivationDate}
📍 **Address:** ${lead.address}
🏭 **NAICS Count:** ${lead.naicsCount}
💡 **NAICS Codes:** ${lead.naicsCodes}
`;
  }).join('\n\n');
}

/**
 * Add call record to lead
 */
export function addCallToLead(lead, callData) {
  return {
    ...lead,
    callHistory: [
      ...lead.callHistory,
      {
        id: `call_${Date.now()}`,
        date: callData.date || new Date().toISOString(),
        outcome: callData.outcome, // answered, voicemail, no-answer, busy
        notes: callData.notes || '',
        duration: callData.duration || ''
      }
    ],
    lastContactDate: callData.date || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Update lead contact info
 */
export function updateLeadContact(lead, contactData) {
  return {
    ...lead,
    phone: contactData.phone || lead.phone,
    email: contactData.email || lead.email,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Update lead status
 */
export function updateLeadStatus(lead, status) {
  return {
    ...lead,
    status,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Add or update notes
 */
export function updateLeadNotes(lead, notes) {
  return {
    ...lead,
    notes,
    updatedAt: new Date().toISOString()
  };
}
