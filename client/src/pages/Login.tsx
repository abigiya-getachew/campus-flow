import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Eye, EyeOff, GraduationCap, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
      toast("Welcome back!");
      navigate("/app");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-3 mb-6">
            <span className="flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 h-12 w-12 text-white">
              <GraduationCap className="h-6 w-6" />
            </span>
            <span className="font-display text-2xl tracking-[-0.04em] text-[#1e2433]">campusflow</span>
          </Link>
          <h2 className="font-display text-3xl tracking-[-0.04em] text-[#1e2433]">Welcome back</h2>
          <p className="mt-2 text-sm text-[#747b88]">Sign in to your account to continue</p>
        </div>

        {/* Login form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#313847] mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#9297a0]" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-[#e4e7ec] rounded-lg bg-white text-[#313847] placeholder-[#a1a6b0] focus:outline-none focus:ring-2 focus:ring-[#3157e8] focus:border-transparent transition"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#313847] mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#9297a0]" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-[#e4e7ec] rounded-lg bg-white text-[#313847] placeholder-[#a1a6b0] focus:outline-none focus:ring-2 focus:ring-[#3157e8] focus:border-transparent transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9297a0] hover:text-[#3157e8] transition"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#3157e8] focus:ring-[#3157e8] border-[#e4e7ec] rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-[#747b88]">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-[#3157e8] hover:text-[#2549d5] transition">
                  Forgot password?
                </Link>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-3 text-[15px] font-semibold text-white shadow-[0_4px_12px_rgba(49,87,232,.18)] transition duration-150 hover:-translate-y-0.5 hover:bg-[#2549d5] active:translate-y-0 active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? "Signing in..." : "Sign in"}
            {!isLoading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        {/* Sign up link */}
        <div className="text-center">
          <p className="text-sm text-[#747b88]">
            Don't have an account?{" "}
            <Link href="/register" className="font-medium text-[#3157e8] hover:text-[#2549d5] transition">
              Sign up for free
            </Link>
          </p>
        </div>

        {/* Back to landing */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-[#9297a0] hover:text-[#313847] transition"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
