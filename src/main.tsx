import {createRoot} from 'react-dom/client';
import '@fontsource-variable/inter';
import App from './App.tsx';
import './index.css';
import {initNativeShell} from './lib/native';

// La détection TV se fait avant le premier rendu pour éviter un saut de mise en page
initNativeShell().finally(() => {
  createRoot(document.getElementById('root')!).render(<App />);
});
