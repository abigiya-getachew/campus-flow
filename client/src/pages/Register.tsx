import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Eye, EyeOff, GraduationCap, Mail, Lock, User, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const [, navigate] = useLocation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      toast("Account created successfully!");
      navigate("/app");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { label: "At least 8 characters", met: formData.password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(formData.password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(formData.password) },
    { label: "Contains number", met: /\d/.test(formData.password) },
  ];

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
          <h2 className="font-display text-3xl tracking-[-0.04em] text-[#1e2433]">Create your account</h2>
          <p className="mt-2 text-sm text-[#747b88]">Start organizing your academic journey today</p>
        </div>

        {/* Register form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#313847] mb-2">
                Full name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-[#9297a0]" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-[#e4e7ec] rounded-lg bg-white text-[#313847] placeholder-[#a1a6b0] focus:outline-none focus:ring-2 focus:ring-[#3157e8] focus:border-transparent transition"
                  placeholder="Avery Morgan"
                />
              </div>
            </div>

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
                  value={formData.email}
                  onChange={handleChange}
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
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
              {/* Password requirements */}
              <div className="mt-2 space-y-1">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <Check
                      className={`h-3 w-3 ${req.met ? "text-[#81a993]" : "text-[#e4e7ec]"}`}
                    />
                    <span className={req.met ? "text-[#81a993]" : "text-[#9297a0]"}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#313847] mb-2">
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#9297a0]" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 border border-[#e4e7ec] rounded-lg bg-white text-[#313847] placeholder-[#a1a6b0] focus:outline-none focus:ring-2 focus:ring-[#3157e8] focus:border-transparent transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9297a0] hover:text-[#3157e8] transition"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-[#3157e8] focus:ring-[#3157e8] border-[#e4e7ec] rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-[#747b88]">
                  I agree to the{" "}
                  <Link href="/terms" className="font-medium text-[#3157e8] hover:text-[#2549d5] transition">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="font-medium text-[#3157e8] hover:text-[#2549d5] transition">
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-3 text-[15px] font-semibold text-white shadow-[0_4px_12px_rgba(49,87,232,.18)] transition duration-150 hover:-translate-y-0.5 hover:bg-[#2549d5] active:translate-y-0 active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? "Creating account..." : "Create account"}
            {!isLoading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        {/* Sign in link */}
        <div className="text-center">
          <p className="text-sm text-[#747b88]">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[#3157e8] hover:text-[#2549d5] transition">
              Sign in
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
