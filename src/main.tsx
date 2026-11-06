import {createRoot} from 'react-dom/client';
import '@fontsource-variable/inter';
import App from './App.tsx';
import './index.css';
import {initNativeShell} from './lib/native';

initNativeShell();

createRoot(document.getElementById('root')!).render(<App />);
