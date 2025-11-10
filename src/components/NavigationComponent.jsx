import React from 'react';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import './NavigationComponent.css';

const NavigationComponent = ({ files, restoreFile, deleteFile, mode }) => {
  const { t } = useTranslation(); // Hook para traducciones

  const handleContextMenu = (event, file) => {
    event.preventDefault();

    // Usar SweetAlert2 para la confirmación
    Swal.fire({
      title: t('deleteConfirmation', { fileName: file.id }),
      text: t('deleteWarning'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: t('yesDelete'),
      cancelButtonText: t('cancel')
    }).then((result) => {
      if (result.isConfirmed) {
        deleteFile(file.id); // Llama a la función para eliminar el archivo si se confirma
      }
    });
  };

  return (
    <div className={`navigation-component ${mode}`}>
      <div className="files-grid">
        {files.map((file) => (
          <div 
            key={file.id} 
            className="file-item"
            onClick={() => restoreFile(file)}
            onContextMenu={(event) => file.id !== 'main.py' && handleContextMenu(event, file)}
          >
            <span>{file.id}</span>
            {file.id !== 'main.py' && (
              <i 
                className="fas fa-trash delete-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleContextMenu(e, file);
                }}
                title={t('deleteFile')}
              ></i>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NavigationComponent;
