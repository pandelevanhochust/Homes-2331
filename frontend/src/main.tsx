import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.jsx";
import "./index.css";
import { store } from "./store.js";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import NotFoundPage from "./NotFoundPage.js";
import LoginScreen from "./screens/LoginScreen.jsx";
import AddStaffScreen from "./screens/AddStaffScreen.jsx";
import StaffProfileScreen from "./screens/StaffProfileScreen.jsx";

const rootElement = document.getElementById("root");
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFoundPage/>
  },
  {
    path: "/login",
    element: <LoginScreen/>
  },
  {
    path: "/addstaff",
    element: <AddStaffScreen/>
  },
  {
    path: "/staff/:id",
    element: <StaffProfileScreen/>
  }
]);

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <RouterProvider router={router} />
      <Provider store={store}>
        <App />
      </Provider>
    </StrictMode>
  );
}
