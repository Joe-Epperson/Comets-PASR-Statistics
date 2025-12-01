import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DataCollection from './pages/DataCollection';
import AnalyzeData from './pages/AnalyzeData';
import PassAction from './pages/actions/PassAction';
import DribbleAction from './pages/actions/DribbleAction';
import ShotAction from './pages/actions/ShotAction';
import SetPieceAction from './pages/actions/SetPieceAction';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/data-collection" element={<DataCollection />} />
        <Route path="/analyze-data" element={<AnalyzeData />} />
        <Route path="/action/pass" element={<PassAction />} />
        <Route path="/action/dribble" element={<DribbleAction />} />
        <Route path="/action/shot" element={<ShotAction />} />
        <Route path="/action/setpiece" element={<SetPieceAction />} />
      </Routes>
    </Router>
  );
}

export default App;
