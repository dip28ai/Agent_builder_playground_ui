import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

function Login() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!username.trim()) return;

    const userName = localStorage.getItem('username');
    print(userName)

    if(username !== userName){
      const userId = uuidv4();
      localStorage.setItem("userId", userId);
      localStorage.setItem("username", username);
    }

    navigate("/app");

  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded shadow-lg w-80">
        <h2 className="text-lg font-medium mb-4">Login</h2>
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-gray-200 text-sm focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded text-sm font-medium cursor-pointer mt-3"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;
