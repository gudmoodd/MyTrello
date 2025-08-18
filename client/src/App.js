import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/authPage";
import BoardList from "./components/boardList";
import BoardPage from "./pages/boardPage";
import InviteResponsePage from "./pages/InviteResponsePage";

function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [email, setEmail] = useState("");
    const [selectedBoard, setSelectedBoard] = useState(null);

    React.useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    const handleLogout = () => {
        setToken(null);
        setEmail("");
        setSelectedBoard(null);
        localStorage.removeItem('token');
    };

    return (
        <Router>
            <Routes>
                <Route path="/invite-response" element={<InviteResponsePage />} />
                <Route
                    path="/"
                    element={
                        !token ? (
                            <AuthPage setToken={setToken} setEmail={setEmail} />
                        ) : !selectedBoard ? (
                            <div>
                                <BoardList
                                    token={token}
                                    email={email}
                                    selectBoard={setSelectedBoard}
                                />
                            </div>
                        ) : (
                            <div>
                                <BoardPage
                                    token={token}
                                    board={selectedBoard}
                                    email={email}
                                    goBack={() => setSelectedBoard(null)}
                                />
                            </div>
                        )
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;