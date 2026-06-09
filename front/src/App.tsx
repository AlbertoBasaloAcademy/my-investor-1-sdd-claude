import { HealthStatus } from './features/health/HealthStatus';
import { RocketFleet } from './features/rockets/RocketFleet';
import './App.css';

function App() {
  return (
    <main className="app-shell">
      <h1 className="app-hero">ab-java-react</h1>
      <HealthStatus />
      <RocketFleet />
    </main>
  );
}

export default App;
