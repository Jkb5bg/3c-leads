import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import LeadsList from './components/LeadsList';
import LeadDetail from './components/LeadDetail';
import { fetchLeadsFromS3, updateLead, saveLeadsToS3, uploadInitialLeadsFile } from './services/s3Service';
import { parseLeadsFile } from './utils/leadsParser';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadLeads();
    }
  }, [isAuthenticated]);

  const loadLeads = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const leadsData = await fetchLeadsFromS3();
      setLeads(leadsData);
    } catch (err) {
      console.error('Error loading leads:', err);
      setError('Failed to load leads. Check your S3 configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    setLeads([]);
    setSelectedLead(null);
  };

  const handleUpdateLead = async (updatedLead) => {
    try {
      await updateLead(updatedLead);

      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === updatedLead.id ? updatedLead : lead
        )
      );

      if (selectedLead && selectedLead.id === updatedLead.id) {
        setSelectedLead(updatedLead);
      }
    } catch (err) {
      console.error('Error updating lead:', err);
      setError('Failed to update lead');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const fileContent = e.target.result;
          const parsedLeads = await uploadInitialLeadsFile(fileContent, parseLeadsFile);
          setLeads(parsedLeads);
          alert(`Successfully imported ${parsedLeads.length} leads!`);
        } catch (err) {
          console.error('Error uploading file:', err);
          setError('Failed to parse and upload leads file');
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsText(file);
    } catch (err) {
      console.error('Error reading file:', err);
      setError('Failed to read file');
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <nav className="top-nav">
        <div className="nav-content">
          <h1 className="nav-title">3C Leads CRM</h1>
          <div className="nav-actions">
            <input
              type="file"
              id="file-upload"
              accept=".txt"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" className="btn-upload">
              Import Leads.txt
            </label>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)} className="error-close">✕</button>
        </div>
      )}

      <main className="main-content">
        <LeadsList
          leads={leads}
          onSelectLead={setSelectedLead}
          onRefresh={loadLeads}
          isLoading={isLoading}
        />
      </main>

      {selectedLead && (
        <LeadDetail
          lead={selectedLead}
          onUpdate={handleUpdateLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}

export default App;
