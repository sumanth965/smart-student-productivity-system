import { useState } from "react";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);
        setTimeout(() => {
            console.log("Login attempt:", { email, password });
            setLoading(false);
            alert("Login successful!");
            setEmail("");
            setPassword("");
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-4">

            {/* Card */}
            <div className="w-full max-w-md rounded-2xl bg-white/20 backdrop-blur-xl shadow-2xl border border-white/30 p-8">

                <h1 className="text-3xl font-bold text-white text-center mb-6">
                    Welcome Back 👋
                </h1>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full rounded-xl px-4 py-3 bg-white/80 text-gray-800 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-indigo-500
                         transition duration-200"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full rounded-xl px-4 py-3 bg-white/80 text-gray-800 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-indigo-500
                         transition duration-200"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="text-sm text-red-200 bg-red-500/30 border border-red-400/40 rounded-lg px-4 py-2">
                            {error}
                        </div>
                    )}

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full rounded-xl py-3 font-semibold text-white
              transition-all duration-300
              ${loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-indigo-500 hover:bg-indigo-600 active:scale-95 shadow-lg"
                            }`}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                {/* Footer */}
                <div className="text-center text-sm text-white/80 mt-6 space-y-2">
                    <p>
                        Don&apos;t have an account?{" "}
                        <a href="#signup" className="underline hover:text-white">
                            Sign up
                        </a>
                    </p>
                    <p>
                        <a href="#forgot" className="underline hover:text-white">
                            Forgot password?
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
