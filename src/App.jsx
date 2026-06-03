import { BrowserRouter } from 'react-router-dom'; // Router 설정을 위해 import
import Router from './Router.jsx'

export default function App() {
  return ( 
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  );
}
