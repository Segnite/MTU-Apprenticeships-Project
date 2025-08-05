import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Home";
import CreateProject from "./Cp";
import responsibles from "./responsibles";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" Component={Home} />
        <Route path="/Cp" Component={CreateProject} />
        <Route path="/responsibles" Component={responsibles} />
      </Routes>
    </Router>
  );
}

export default App;
