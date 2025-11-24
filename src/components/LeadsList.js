import React, { useState, useEffect } from 'react';
import './LeadsList.css';

function LeadsList({ leads, onSelectLead, onRefresh, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const filteredLeads = leads
    .filter(lead => {
      // Status filter
      if (statusFilter !== 'all' && lead.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          lead.company.toLowerCase().includes(search) ||
          lead.pocName.toLowerCase().includes(search) ||
          lead.uei.toLowerCase().includes(search) ||
          lead.address.toLowerCase().includes(search) ||
          lead.phone.toLowerCase().includes(search) ||
          lead.email.toLowerCase().includes(search)
        );
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        case 'oldest':
          return new Date(a.updatedAt) - new Date(b.updatedAt);
        case 'company':
          return a.company.localeCompare(b.company);
        case 'lastContact':
          if (!a.lastContactDate && !b.lastContactDate) return 0;
          if (!a.lastContactDate) return 1;
          if (!b.lastContactDate) return -1;
          return new Date(b.lastContactDate) - new Date(a.lastContactDate);
        default:
          return 0;
      }
    });

  const statusCounts = {
    all: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    unqualified: leads.filter(l => l.status === 'unqualified').length
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
    <div className="leads-list-container">
      <div className="leads-header">
        <div className="header-top">
          <h1>Leads Dashboard</h1>
          <button onClick={onRefresh} disabled={isLoading} className="btn-refresh">
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-label">Total Leads</span>
            <span className="stat-value">{statusCounts.all}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">New</span>
            <span className="stat-value" style={{ color: '#3b82f6' }}>{statusCounts.new}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Contacted</span>
            <span className="stat-value" style={{ color: '#f59e0b' }}>{statusCounts.contacted}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Qualified</span>
            <span className="stat-value" style={{ color: '#10b981' }}>{statusCounts.qualified}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Unqualified</span>
            <span className="stat-value" style={{ color: '#ef4444' }}>{statusCounts.unqualified}</span>
          </div>
        </div>

        <div className="filters-bar">
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="unqualified">Unqualified</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="recent">Recently Updated</option>
            <option value="oldest">Oldest First</option>
            <option value="company">Company Name</option>
            <option value="lastContact">Last Contact</option>
          </select>
        </div>
      </div>

      <div className="leads-grid">
        {filteredLeads.length === 0 ? (
          <div className="no-leads">
            <p>No leads found matching your criteria</p>
          </div>
        ) : (
          filteredLeads.map(lead => (
            <div
              key={lead.id}
              className="lead-card"
              onClick={() => onSelectLead(lead)}
            >
              <div className="lead-card-header">
                <h3>{lead.company}</h3>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(lead.status) }}
                >
                  {lead.status}
                </span>
              </div>

              <div className="lead-card-body">
                <div className="lead-info-row">
                  <span className="label">POC:</span>
                  <span className="value">{lead.pocName}</span>
                </div>

                <div className="lead-info-row">
                  <span className="label">UEI:</span>
                  <span className="value">{lead.uei}</span>
                </div>

                {lead.phone && (
                  <div className="lead-info-row">
                    <span className="label">Phone:</span>
                    <span className="value">{lead.phone}</span>
                  </div>
                )}

                {lead.email && (
                  <div className="lead-info-row">
                    <span className="label">Email:</span>
                    <span className="value">{lead.email}</span>
                  </div>
                )}

                <div className="lead-info-row">
                  <span className="label">Calls:</span>
                  <span className="value">{lead.callHistory.length}</span>
                </div>

                {lead.lastContactDate && (
                  <div className="lead-info-row">
                    <span className="label">Last Contact:</span>
                    <span className="value">
                      {new Date(lead.lastContactDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LeadsList;
