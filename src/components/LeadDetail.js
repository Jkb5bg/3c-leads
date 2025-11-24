import React, { useState } from 'react';
import './LeadDetail.css';

function LeadDetail({ lead, onUpdate, onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState({ ...lead });
  const [showCallForm, setShowCallForm] = useState(false);
  const [callData, setCallData] = useState({
    outcome: 'answered',
    notes: '',
    duration: ''
  });

  const handleSave = () => {
    onUpdate(editedLead);
    setIsEditing(false);
  };

  const handleAddCall = () => {
    const newCall = {
      id: `call_${Date.now()}`,
      date: new Date().toISOString(),
      outcome: callData.outcome,
      notes: callData.notes,
      duration: callData.duration
    };

    const updatedLead = {
      ...editedLead,
      callHistory: [...editedLead.callHistory, newCall],
      lastContactDate: newCall.date,
      status: editedLead.status === 'new' ? 'contacted' : editedLead.status,
      updatedAt: new Date().toISOString()
    };

    setEditedLead(updatedLead);
    onUpdate(updatedLead);
    setShowCallForm(false);
    setCallData({ outcome: 'answered', notes: '', duration: '' });
  };

  const handleStatusChange = (newStatus) => {
    const updatedLead = {
      ...editedLead,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };
    setEditedLead(updatedLead);
    onUpdate(updatedLead);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return '#3b82f6';
      case 'contacted': return '#f59e0b';
      case 'qualified': return '#10b981';
      case 'unqualified': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="lead-detail-overlay" onClick={onClose}>
      <div className="lead-detail-container" onClick={(e) => e.stopPropagation()}>
        <div className="detail-header">
          <div>
            <h2>{lead.company}</h2>
            <p className="lead-uei">UEI: {lead.uei}</p>
          </div>
          <button onClick={onClose} className="btn-close">✕</button>
        </div>

        <div className="detail-body">
          {/* Status Section */}
          <section className="detail-section">
            <h3>Status</h3>
            <div className="status-buttons">
              {['new', 'contacted', 'qualified', 'unqualified'].map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`btn-status ${editedLead.status === status ? 'active' : ''}`}
                  style={{
                    backgroundColor: editedLead.status === status ? getStatusColor(status) : '#f3f4f6',
                    color: editedLead.status === status ? 'white' : '#374151'
                  }}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </section>

          {/* Contact Information */}
          <section className="detail-section">
            <div className="section-header">
              <h3>Contact Information</h3>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="btn-edit">
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="edit-form">
                <div className="form-row">
                  <label>POC Name</label>
                  <input
                    type="text"
                    value={editedLead.pocName}
                    onChange={(e) => setEditedLead({ ...editedLead, pocName: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={editedLead.phone}
                    onChange={(e) => setEditedLead({ ...editedLead, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="form-row">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editedLead.email}
                    onChange={(e) => setEditedLead({ ...editedLead, email: e.target.value })}
                    placeholder="contact@company.com"
                  />
                </div>

                <div className="form-row">
                  <label>Address</label>
                  <input
                    type="text"
                    value={editedLead.address}
                    onChange={(e) => setEditedLead({ ...editedLead, address: e.target.value })}
                  />
                </div>

                <div className="form-actions">
                  <button onClick={handleSave} className="btn-save">Save</button>
                  <button onClick={() => {
                    setEditedLead({ ...lead });
                    setIsEditing(false);
                  }} className="btn-cancel">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">POC Name</span>
                  <span className="info-value">{lead.pocName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone</span>
                  <span className="info-value">{lead.phone || 'Not set'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">{lead.email || 'Not set'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Address</span>
                  <span className="info-value">{lead.address}</span>
                </div>
              </div>
            )}
          </section>

          {/* Company Details */}
          <section className="detail-section">
            <h3>Company Details</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Initial Entity Date</span>
                <span className="info-value">{lead.initialEntityDate}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Activation Date</span>
                <span className="info-value">{lead.recentActivationDate}</span>
              </div>
              <div className="info-item">
                <span className="info-label">NAICS Count</span>
                <span className="info-value">{lead.naicsCount}</span>
              </div>
              <div className="info-item">
                <span className="info-label">NAICS Codes</span>
                <span className="info-value">{lead.naicsCodes}</span>
              </div>
            </div>
          </section>

          {/* Call History */}
          <section className="detail-section">
            <div className="section-header">
              <h3>Call History ({editedLead.callHistory.length})</h3>
              <button onClick={() => setShowCallForm(true)} className="btn-add-call">
                + Add Call
              </button>
            </div>

            {showCallForm && (
              <div className="call-form">
                <div className="form-row">
                  <label>Outcome</label>
                  <select
                    value={callData.outcome}
                    onChange={(e) => setCallData({ ...callData, outcome: e.target.value })}
                  >
                    <option value="answered">Answered</option>
                    <option value="voicemail">Voicemail</option>
                    <option value="no-answer">No Answer</option>
                    <option value="busy">Busy</option>
                  </select>
                </div>

                <div className="form-row">
                  <label>Duration (optional)</label>
                  <input
                    type="text"
                    value={callData.duration}
                    onChange={(e) => setCallData({ ...callData, duration: e.target.value })}
                    placeholder="5 minutes"
                  />
                </div>

                <div className="form-row">
                  <label>Notes</label>
                  <textarea
                    value={callData.notes}
                    onChange={(e) => setCallData({ ...callData, notes: e.target.value })}
                    placeholder="Call notes..."
                    rows="3"
                  />
                </div>

                <div className="form-actions">
                  <button onClick={handleAddCall} className="btn-save">Save Call</button>
                  <button onClick={() => {
                    setShowCallForm(false);
                    setCallData({ outcome: 'answered', notes: '', duration: '' });
                  }} className="btn-cancel">Cancel</button>
                </div>
              </div>
            )}

            <div className="call-history-list">
              {editedLead.callHistory.length === 0 ? (
                <p className="no-calls">No calls recorded yet</p>
              ) : (
                editedLead.callHistory.map(call => (
                  <div key={call.id} className="call-record">
                    <div className="call-header">
                      <span className="call-date">
                        {new Date(call.date).toLocaleString()}
                      </span>
                      <span className={`call-outcome outcome-${call.outcome}`}>
                        {call.outcome}
                      </span>
                    </div>
                    {call.duration && (
                      <div className="call-duration">Duration: {call.duration}</div>
                    )}
                    {call.notes && (
                      <div className="call-notes">{call.notes}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Notes Section */}
          <section className="detail-section">
            <h3>Notes</h3>
            <textarea
              value={editedLead.notes}
              onChange={(e) => {
                const updated = { ...editedLead, notes: e.target.value };
                setEditedLead(updated);
              }}
              onBlur={() => onUpdate(editedLead)}
              placeholder="Add notes about this lead..."
              rows="4"
              className="notes-textarea"
            />
          </section>
        </div>
      </div>
    </div>
  );
}

export default LeadDetail;
