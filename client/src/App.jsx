import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Homepage from "./pages/Homepage";
import EvaluationForm from "./pages/EvaluationForm";
import Docentes from "./pages/Docentes";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/evaluar" element={<EvaluationForm />} />
        <Route path="/docentes" element={<Docentes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
