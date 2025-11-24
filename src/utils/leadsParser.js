/**
 * Parser for leads.txt file
 * Parses the formatted lead data into structured JSON objects
 */

export function parseLeadsFile(fileContent) {
  const leads = [];
  const leadBlocks = fileContent.split('========================================================');

  leadBlocks.forEach(block => {
    const trimmedBlock = block.trim();
    if (!trimmedBlock || !trimmedBlock.includes('⭐ Qualified Lead:')) {
      return;
    }

    const lead = {
      id: generateLeadId(),
      company: extractField(trimmedBlock, '⭐ Qualified Lead:', '\n'),
      uei: extractField(trimmedBlock, '🆔 \\*\\*UEI:\\*\\*', '\n'),
      pocName: extractField(trimmedBlock, '👤 \\*\\*POC Name:\\*\\*', '\n'),
      initialEntityDate: extractField(trimmedBlock, '📅 \\*\\*Initial Entity Date \\(2-Year Filter\\):\\*\\*', '\n'),
      recentActivationDate: extractField(trimmedBlock, '✅ \\*\\*Recent Activation Date \\(3-Month Filter\\):\\*\\*', '\n'),
      address: extractField(trimmedBlock, '📍 \\*\\*Address:\\*\\*', '\n'),
      naicsCount: extractField(trimmedBlock, '🏭 \\*\\*NAICS Count:\\*\\*', '\n'),
      naicsCodes: extractField(trimmedBlock, '💡 \\*\\*NAICS Codes:\\*\\*', '\n'),

      // Contact info to be added manually
      phone: '',
      email: '',

      // Tracking fields
      callHistory: [],
      notes: '',
      status: 'new', // new, contacted, qualified, unqualified
      lastContactDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    leads.push(lead);
  });

  return leads;
}

/**
 * Extract field value using regex pattern
 */
function extractField(text, fieldPattern, endPattern) {
  const regex = new RegExp(`${fieldPattern}\\s*(.+?)${endPattern}`, 's');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
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
