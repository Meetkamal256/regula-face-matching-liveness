import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Verification from "./Verification";
// import LivenessTest from "./LivenessTest";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Verification />} />
        {/* <Route path="/liveness-test" element={<LivenessTest />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
