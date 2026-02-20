"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [userData, setUserData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const userDataHandler = (e) => {
    setUserData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
        credentials: "include",
      });

      const data = await res.json();
      console.log("Login response:", data); 

      if (data.success) {
        router.refresh();   
        router.push("/dashboard");  
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Login fetch error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <div className="bg-[#2f3293] p-10 rounded-3xl min-w-[500px] text-white">
        <h1 className="text-white text-center text-2xl font-semibold">
          CMS Login
        </h1>

        {error && (
          <p className="mt-4 text-center text-sm text-red-300 bg-red-900/30 py-2 px-4 rounded-lg">
            {error}
          </p>
        )}

        <form className="flex flex-col gap-5 mt-10" onSubmit={submitHandler}>
          <input
            type="email"
            placeholder="Enter your email"
            className="p-4 rounded border border-white w-full text-black outline-none"
            name="email"
            value={userData.email}
            onChange={userDataHandler}
            required
          />
          <input
            type="password"
            placeholder="Enter your password"
            className="p-4 rounded border border-white w-full text-black outline-none"
            name="password"
            value={userData.password}
            onChange={userDataHandler}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-4 rounded-2xl text-white text-lg font-semibold bg-black mt-6 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Logging in..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
