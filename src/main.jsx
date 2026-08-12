import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./styles.css";
// Depois do styles.css de proposito: a camada de animacao complementa e, em
// alguns pontos, precisa vencer o estilo original por ordem de cascata.
import "./animacoes.css";
import Site from "./Site.jsx";

// O painel so e baixado por quem abre /admin. O visitante da paroquia nunca
// carrega o codigo do formulario, do upload nem do login.
const Admin = lazy(() => import("./admin/Admin.jsx"));

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Site />} />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<div className="adm-carregando">Carregando painel...</div>}>
              <Admin />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
