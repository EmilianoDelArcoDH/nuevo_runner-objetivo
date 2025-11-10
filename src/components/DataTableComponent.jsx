import React, { useState } from 'react';
import Papa from 'papaparse';
import DataTable from 'react-data-table-component';

const DataTableComponent = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  // Maneja la carga y parseo del archivo CSV
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,        // Usa la primera fila como encabezado
      skipEmptyLines: true, // Ignora líneas vacías
      complete: (results) => {
        const parsedData = results.data;
        if (parsedData.length > 0) {
          // Genera dinámicamente las columnas a partir de las claves del primer objeto
          const cols = Object.keys(parsedData[0]).map((key) => ({
            name: key,
            selector: (row) => row[key],
            sortable: true,
          }));
          setColumns(cols);
        }
        setData(parsedData);
      },
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Subir CSV y visualizar tabla</h2>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      {data.length > 0 && (
        <DataTable
          columns={columns}
          data={data}
          pagination
          responsive
          highlightOnHover
        />
      )}
    </div>
  );
};

export default DataTableComponent;
