import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Timetable from "./pages/Timetable/Timetable";
import Signin from "./pages/Signin/Signin";
import Signup from "./pages/Signup/Signup";

export default function Router() {
    return(
        <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/Timetable" element={<Timetable/>} />
            <Route path="/Signin" element={<Signin/>} />
            <Route path="/Signup" element={<Signup/>} />
        </Routes>
    );
}
