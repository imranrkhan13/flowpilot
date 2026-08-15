import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SimulationPage from './pages/SimulationPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/simulate/:scenarioId" element={<SimulationPage />} />
    </Routes>
  );
}

export default App;
