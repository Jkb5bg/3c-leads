import React, { useState, useEffect } from 'react';
import './LeadsList.css';

function LeadsList({ leads, onSelectLead, onRefresh, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 50; // Show 50 leads per page

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

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

  // Calculate pagination
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);
  const startIndex = (currentPage - 1) * leadsPerPage;
  const endIndex = startIndex + leadsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return '#3b82f6';
      case 'contacted': return '#f59e0b';
      case 'qualified': return '#10b981';
      case 'unqualified': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          paginatedLeads.map(lead => {
            // Check if anyone answered
            const hasAnswered = lead.callHistory.some(call => call.outcome === 'answered');
            // Get most recent call
            const mostRecentCall = lead.callHistory.length > 0
              ? lead.callHistory[lead.callHistory.length - 1]
              : null;

            return (
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

                {/* Call Status Banner */}
                {lead.callHistory.length > 0 && (
                  <div className={`call-status-banner ${hasAnswered ? 'answered' : 'not-answered'}`}>
                    <div className="call-status-info">
                      <span className="call-status-label">
                        {hasAnswered ? '✓ Answered' : '○ Not Answered'}
                      </span>
                      {mostRecentCall && (
                        <span className="call-time">
                          Last call: {new Date(mostRecentCall.date).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                )}

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
            );
          })
        )}
      </div>

      {filteredLeads.length > 0 && totalPages > 1 && (
        <div className="pagination">
          <div className="pagination-info">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredLeads.length)} of {filteredLeads.length} leads
          </div>

          <div className="pagination-controls">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="page-btn"
            >
              « First
            </button>

            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="page-btn"
            >
              ‹ Prev
            </button>

            <div className="page-numbers">
              {currentPage > 2 && (
                <>
                  <button onClick={() => goToPage(1)} className="page-number">1</button>
                  {currentPage > 3 && <span className="page-ellipsis">...</span>}
                </>
              )}

              {currentPage > 1 && (
                <button onClick={() => goToPage(currentPage - 1)} className="page-number">
                  {currentPage - 1}
                </button>
              )}

              <button className="page-number active">{currentPage}</button>

              {currentPage < totalPages && (
                <button onClick={() => goToPage(currentPage + 1)} className="page-number">
                  {currentPage + 1}
                </button>
              )}

              {currentPage < totalPages - 1 && (
                <>
                  {currentPage < totalPages - 2 && <span className="page-ellipsis">...</span>}
                  <button onClick={() => goToPage(totalPages)} className="page-number">
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="page-btn"
            >
              Next ›
            </button>

            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="page-btn"
            >
              Last »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeadsList;
