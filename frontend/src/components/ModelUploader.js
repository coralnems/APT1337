import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import axios from 'axios';
import { Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

function ModelUploader({ token }) {
  const fileInput = useRef();
  const [modelUrl, setModelUrl] = useState(null);
  const [printerId, setPrinterId] = useState('');
  const [printers, setPrinters] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/printers`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => setPrinters(res.data));
  }, [token]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setModelUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    const file = fileInput.current.files[0];
    const canvas = document.querySelector('canvas');
    const image = canvas.toDataURL('image/png');
    const blob = await (await fetch(image)).blob();

    const formData = new FormData();
    formData.append('stl', file);
    formData.append('image', blob, 'model.png');
    formData.append('printer_id', printerId);

    await axios.post(`${process.env.REACT_APP_API_URL}/printjobs`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const geometry = modelUrl ? useLoader(STLLoader, modelUrl) : null;

  return (
    <div>
      <input type="file" ref={fileInput} accept=".stl" onChange={handleFileChange} />
      <FormControl>
        <InputLabel>Printer</InputLabel>
        <Select value={printerId} onChange={(e) => setPrinterId(e.target.value)}>
          {printers.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
        </Select>
      </FormControl>
      <Button onClick={handleUpload}>Print</Button>
      {modelUrl && (
        <Canvas style={{ height: '400px' }}>
          <mesh geometry={geometry}>
            <meshStandardMaterial color="gray" />
          </mesh>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
        </Canvas>
      )}
    </div>
  );
}

export default ModelUploader;