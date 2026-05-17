import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { Dashboard } from "./pages/Dashboard";
import { Scholarships } from "./pages/Scholarships";
import { Diary } from "./pages/Diary";
import { TimetableView } from "./pages/TimetableView";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/signup",
    Component: Signup,
  },
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: "scholarships", Component: Scholarships },
      { path: "diary", Component: Diary },
      { path: "timetable", Component: TimetableView },
    ],
  },
]);
