import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Sistema de design do site, dividido em modulos por secao.
import "./estilos/index.css";
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
