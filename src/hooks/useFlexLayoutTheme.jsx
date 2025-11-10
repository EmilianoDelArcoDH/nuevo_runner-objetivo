import { useEffect } from 'react';

const useFlexLayoutTheme = (mode) => {
  useEffect(() => {
    const existingLink = document.getElementById('flexlayout-theme');
    if (existingLink) {
      existingLink.parentNode.removeChild(existingLink);
    }

    const link = document.createElement('link');
    link.id = 'flexlayout-theme';
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 
      mode === 'dark' 
        ? '/flex-layout-dark.css' 
        : '/flex-layout-light.css';

    document.head.appendChild(link);

    return () => {
      if (link) {
        link.parentNode.removeChild(link);
      }
    };
  }, [mode]);
};

export default useFlexLayoutTheme;
