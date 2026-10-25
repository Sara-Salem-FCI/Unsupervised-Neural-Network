import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { FoundationsPage } from './pages/FoundationsPage';
import { ModelHub } from './pages/ModelHub';
import { MaxnetJourney } from './pages/models/MaxnetJourney';
import { MexicanHatJourney } from './pages/models/MexicanHatJourney';
import { SOMJourney } from './pages/models/SOMJourney';
import { HammingJourney } from './pages/models/HammingJourney';
import { DiscoveryPage } from './pages/DiscoveryPage';
import { ChallengeLab } from './pages/ChallengeLab';
import { ResearchLibrary } from './pages/ResearchLibrary';
import { TutorPage } from './pages/TutorPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="foundations" element={<FoundationsPage />} />
        <Route path="models" element={<ModelHub />} />
        <Route path="models/maxnet" element={<MaxnetJourney />} />
        <Route path="models/mexican-hat" element={<MexicanHatJourney />} />
        <Route path="models/som" element={<SOMJourney />} />
        <Route path="models/hamming" element={<HammingJourney />} />
        <Route path="discover" element={<DiscoveryPage />} />
        <Route path="challenges" element={<ChallengeLab />} />
        <Route path="research" element={<ResearchLibrary />} />
        <Route path="tutor" element={<TutorPage />} />
      </Route>
    </Routes>
  );
}

export default App;
