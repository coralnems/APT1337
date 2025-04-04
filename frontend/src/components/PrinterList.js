import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button } from '@mui/material';

function PrinterList({ token }) {
  const [printers, setPrinters] = useState([]);
  const [name, setName] = useState('');
  const [octoprintUrl, setOctoprintUrl] = useState('');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/printers`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => setPrinters(res.data));
  }, [token]);

  const addPrinter = async () => {
    await axios.post(`${process.env.REACT_APP_API_URL}/printers`, {
      name,
      octoprint_url: octoprintUrl,
      api_key: apiKey,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPrinters([...printers, { name, octoprint_url: octoprintUrl, api_key: apiKey }]);
  };

  return (
    <div>
      <h2>Printers</h2>
      {printers.map(p => <div key={p.id}>{p.name} - {p.octoprint_url}</div>)}
      <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <TextField label="OctoPrint URL" value={octoprintUrl} onChange={(e) => setOctoprintUrl(e.target.value)} />
      <TextField label="API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
      <Button onClick={addPrinter}>Add Printer</Button>
    </div>
  );
}

export default PrinterList;