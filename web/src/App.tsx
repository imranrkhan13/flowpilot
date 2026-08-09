import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SimulationPage from './pages/SimulationPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/simulate/:scenarioId" element={<SimulationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
