import { useNavigate } from 'react-router-dom';
import './AnalyzeData.css';

function AnalyzeData() {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="analyze-data-container">
      <div className="analyze-data-content">
        <h1>Data Analysis</h1>

        <div className="placeholder-message">
          <p>Data analysis and visualization interface coming soon...</p>
          <p>This is where you'll view and analyze collected player action statistics.</p>
        </div>

        <button className="back-button" onClick={handleBackToHome}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default AnalyzeData;
