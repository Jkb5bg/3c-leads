import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import LeadsList from './components/LeadsList';
import LeadDetail from './components/LeadDetail';
import { fetchLeadsFromS3, updateLead, saveLeadsToS3, uploadInitialLeadsFile } from './services/s3Service';
import { parseLeadsFile } from './utils/leadsParser';
import { parseCSVLeadsFile } from './utils/csvParser';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const saveTimeoutRef = React.useRef(null);

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

  // Save pending changes on page unload
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (saveTimeoutRef.current && leads.length > 0) {
        clearTimeout(saveTimeoutRef.current);
        // Use navigator.sendBeacon for reliable save on page close
        const blob = new Blob([JSON.stringify(leads, null, 2)], { type: 'application/json' });
        const url = `${process.env.REACT_APP_S3_BUCKET_URL}/leads-data.json`;
        navigator.sendBeacon(url, blob);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [leads]);

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

  const handleLogout = async () => {
    // Save any pending changes before logout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      try {
        await saveLeadsToS3(leads);
        console.log('✓ Saved pending changes before logout');
      } catch (err) {
        console.error('Error saving before logout:', err);
      }
    }

    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    setLeads([]);
    setSelectedLead(null);
  };

  const handleUpdateLead = async (updatedLead) => {
    // Optimistic update - update UI immediately for instant response
    const updatedLeads = leads.map(lead =>
      lead.id === updatedLead.id ? updatedLead : lead
    );

    setLeads(updatedLeads);

    if (selectedLead && selectedLead.id === updatedLead.id) {
      setSelectedLead(updatedLead);
    }

    // Debounce saves to S3 - only save after 2 seconds of no activity
    // This batches multiple quick edits into one save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveLeadsToS3(updatedLeads);
        console.log('✓ Saved to S3');
      } catch (err) {
        console.error('Error saving to S3:', err);
        setError('Warning: Changes not saved to S3. Will retry...');
      }
    }, 2000); // Wait 2 seconds after last change
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const isCSV = file.name.toLowerCase().endsWith('.csv');
    const isTXT = file.name.toLowerCase().endsWith('.txt');

    if (!isCSV && !isTXT) {
      setError('Please upload a .txt or .csv file');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const fileContent = e.target.result;

          if (isCSV) {
            // CSV: Parse and ADD to existing leads
            const newLeads = parseCSVLeadsFile(fileContent);
            const combinedLeads = [...leads, ...newLeads];
            await saveLeadsToS3(combinedLeads);
            setLeads(combinedLeads);
            alert(`Successfully added ${newLeads.length} fresh leads!\nTotal leads: ${combinedLeads.length}`);
          } else {
            // TXT: Parse and REPLACE all leads
            const parsedLeads = await uploadInitialLeadsFile(fileContent, parseLeadsFile);
            setLeads(parsedLeads);
            alert(`Successfully imported ${parsedLeads.length} leads!`);
          }
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
              accept=".txt,.csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" className="btn-upload">
              Import Leads
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
