import { HealthStatus } from './features/health/HealthStatus';
import { RocketFleet } from './features/rockets/RocketFleet';
import { LaunchManifest } from './features/launches/LaunchManifest';
import './App.css';

function App() {
  return (
    <main className="app-shell">
      <h1 className="app-hero">ab-java-react</h1>
      <HealthStatus />
      <RocketFleet />
      <LaunchManifest />
    </main>
  );
}

export default App;
