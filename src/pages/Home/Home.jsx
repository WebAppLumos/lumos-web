import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
    // 임시 메인 페이지(Link만)
    return(
        <div className="link">
            <Link to={"/Timetable"}>Timetable</Link> <br/>
            <Link to={"/Signup"}>Signup</Link> <br/>
            <Link to={"/Signin"}>Signin</Link>
        </div>
    );
}
