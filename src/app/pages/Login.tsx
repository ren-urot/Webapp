import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import svgPaths from "../../imports/svg-vr1w7212pc";
import { supabase } from "../lib/supabase";
import * as api from "../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/", { replace: true });
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      console.log("Attempting login for:", email);
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error("Login error:", authError.message);
        if (authError.message.includes("Invalid login credentials") || authError.message.includes("Email not confirmed")) {
          // Check if the user exists but hasn't verified their email
          try {
            const check = await api.loginCheck(email);
            if (check.exists && !check.verified) {
              setError("Your email hasn't been verified yet. Please complete the signup process to verify your email, or sign up again to get a new verification code.");
            } else if (!check.exists) {
              setError("No account found with this email. Please sign up first.");
            } else {
              setError("Invalid password. Please check your credentials and try again.");
            }
          } catch {
            setError("Invalid email or password. Please check your credentials or sign up for a new account.");
          }
        } else {
          setError(authError.message);
        }
        return;
      }

      if (data.session) {
        console.log("Login successful, user:", data.user?.email);
        navigate("/");
      }
    } catch (err: any) {
      console.error("Unexpected login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* Left Side - Image */}
      <div className="hidden lg:block w-[45%] relative">
        <img
          src="https://images.unsplash.com/photo-1642616824479-0e19a05408f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmFuZ2UlMjBmbG93ZXJzJTIwYm91cXVldCUyMHdhcm0lMjB0b25lc3xlbnwxfHx8fDE3NzMyOTAxMzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Orange flower arrangement"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#ff4e00]/40" />
        <div className="absolute bottom-12 left-10 right-10 text-center">
          <p className="text-white/90 text-[16px]">
            Manage your flowershop with ease. Track sales, inventory, workshops, and customers all in one place.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-[440px]">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="h-7 w-[130px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 111.217 24.2384">
                <g>
                  <path d={svgPaths.p35e1f00} fill="#FF4E00" />
                  <path d={svgPaths.p3f84db00} fill="#383838" />
                  <path d={svgPaths.p387e2d00} fill="#383838" />
                  <path d={svgPaths.pd3ea180} fill="#383838" />
                  <path d={svgPaths.p3e529840} fill="#383838" />
                  <path d={svgPaths.p1a2e7680} fill="#FF4E00" />
                  <path d={svgPaths.p326996f2} fill="#FF4E00" />
                  <path d={svgPaths.p3a897f80} fill="#383838" />
                  <path d={svgPaths.pc62baf0} fill="#383838" />
                  <path d={svgPaths.p11c05700} fill="#383838" />
                </g>
              </svg>
            </div>
            <div className="w-[2px] h-7 bg-[#ff4e00]" />
            <span className="text-[#383838] text-[20px] font-medium">Flowershop CRM</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-[#383838] text-[28px] font-semibold mb-1">Log In</h1>
            <p className="text-[#9a9a9a] text-[15px]">
              Welcome back! Please enter your credentials.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-[#fef2f2] border border-[#fca5a5] rounded-lg text-[#dc2626] text-[14px]">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-[#383838] text-[14px] font-medium mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#b0b0b0]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@bloomshop.com"
                  className="w-full pl-11 pr-4 py-3 bg-[#f6f6f6] border border-[#e0e0e0] rounded-lg text-[#383838] text-[15px] placeholder:text-[#b0b0b0] focus:outline-none focus:border-[#ff4e00] focus:ring-1 focus:ring-[#ff4e00] transition-colors"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[#383838] text-[14px] font-medium mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#b0b0b0]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3 bg-[#f6f6f6] border border-[#e0e0e0] rounded-lg text-[#383838] text-[15px] placeholder:text-[#b0b0b0] focus:outline-none focus:border-[#ff4e00] focus:ring-1 focus:ring-[#ff4e00] transition-colors"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b0b0b0] hover:text-[#5d5d5d] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#d0d0d0] text-[#ff4e00] accent-[#ff4e00] cursor-pointer"
                />
                <span className="text-[#5d5d5d] text-[14px]">Remember me</span>
              </label>
              <button type="button" className="text-[#ff4e00] text-[14px] font-medium hover:underline">
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#ff4e00] text-white rounded-lg hover:bg-[#e64600] transition-colors font-semibold text-[16px] shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#e0e0e0]" />
            <span className="text-[#b0b0b0] text-[13px]">or</span>
            <div className="flex-1 h-px bg-[#e0e0e0]" />
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-[#5d5d5d] text-[15px]">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#ff4e00] font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}