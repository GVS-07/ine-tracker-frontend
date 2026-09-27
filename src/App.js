import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase Client  keys
const supabaseUrl = 'https://edsijxyvapkxshyytssn.supabase.co';
const supabaseKey = 'sb_publishable_eLoH5JVRYk9qtFKYmcXtgQ_o1mdSv6n';
const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [productName, setProductName] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('scrape_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching logs:', error);
    } else {
      setLogs(data);
    }
  };

  const handleTrackProduct = async (e) => {
    e.preventDefault();
    if (!productName || !productUrl) return alert("Please fill in both fields.");
    
    setLoading(true);
    const { error } = await supabase
      .from('tracked_products')
      .insert([{ product_name: productName, product_url: productUrl }]);

    setLoading(false);

    if (error) {
      alert("Error adding product.");
      console.error(error);
    } else {
      alert("Product added successfully! The scraper will now track it.");
      setProductName('');
      setProductUrl('');
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return alert("No data available to export.");

    const headers = "ID,Product Name,Timestamp,Price,Stock,Outcome\n";
    const rows = logs.map(log => {
      const safeName = log.product_name ? log.product_name.replace(/,/g, '') : '';
      const safePrice = log.price ? log.price.replace(/,/g, '') : '';
      const safeStock = log.stock ? log.stock.replace(/,/g, '') : '';
      const timestamp = new Date(log.created_at).toISOString();

      return `${log.id},${safeName},${timestamp},${safePrice},${safeStock},${log.outcome}`;
    }).join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "scrape_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h1>INE Product Price Tracker</h1>
      
      <div style={{ backgroundColor: '#f4f4f9', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>Track a New Product</h3>
        <form onSubmit={handleTrackProduct}>
          <input 
            type="text" 
            placeholder="Product Name (e.g., Pinecrest Tablet)" 
            value={productName} 
            onChange={(e) => setProductName(e.target.value)} 
            style={{ padding: '10px', width: '250px', marginRight: '10px' }}
          />
          <input 
            type="url" 
            placeholder="Product URL (from INE Mock Store)" 
            value={productUrl} 
            onChange={(e) => setProductUrl(e.target.value)} 
            style={{ padding: '10px', width: '350px', marginRight: '10px' }}
          />
          <button type="submit" disabled={loading} style={{ padding: '10px 20px', cursor: 'pointer' }}>
            {loading ? 'Adding...' : 'Track Product'}
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Scrape History & Logs</h2>
        <div>
          <button onClick={fetchLogs} style={{ padding: '10px', marginRight: '10px', cursor: 'pointer' }}>Refresh Data</button>
          <button onClick={handleExportCSV} style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}>Export to CSV</button>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
        <thead>
          <tr style={{ backgroundColor: '#ddd', textAlign: 'left' }}>
            <th style={{ padding: '12px', border: '1px solid #ccc' }}>Product</th>
            <th style={{ padding: '12px', border: '1px solid #ccc' }}>Price</th>
            <th style={{ padding: '12px', border: '1px solid #ccc' }}>Stock</th>
            <th style={{ padding: '12px', border: '1px solid #ccc' }}>Outcome</th>
            <th style={{ padding: '12px', border: '1px solid #ccc' }}>Time (Local)</th>
          </tr>
        </thead>
        <tbody>
          {logs.length > 0 ? (
            logs.map(log => (
              <tr key={log.id}>
                <td style={{ padding: '10px', border: '1px solid #ccc' }}>{log.product_name}</td>
                <td style={{ padding: '10px', border: '1px solid #ccc' }}>{log.price || '-'}</td>
                <td style={{ padding: '10px', border: '1px solid #ccc' }}>{log.stock || '-'}</td>
                <td style={{ padding: '10px', border: '1px solid #ccc', color: log.outcome === 'success' ? 'green' : 'red' }}>
                  {log.outcome}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ccc' }}>
                  {new Date(log.created_at).toLocaleString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ padding: '20px', textAlign: 'center', border: '1px solid #ccc' }}>No scrape logs found yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;