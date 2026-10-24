import {createRoot} from 'react-dom/client';
import './app.css';
import {StoreProvider} from './store.jsx';
import App from './App.jsx';

createRoot(document.getElementById('app')).render(<StoreProvider><App/></StoreProvider>);
