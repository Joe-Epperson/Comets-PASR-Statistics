import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DataCollection from './pages/DataCollection';
import AnalyzeData from './pages/AnalyzeData';
import PassAction from './pages/actions/PassAction';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/data-collection" element={<DataCollection />} />
        <Route path="/analyze-data" element={<AnalyzeData />} />
        <Route path="/action/pass" element={<PassAction />} />
      </Routes>
    </Router>
  );
}

export default App;
