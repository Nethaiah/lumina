import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import Wattify from "@/assets/wattify-logo.svg"
import { ref, set, get } from "firebase/database";
import { auth, database } from "../firebase"; // Import from your firebase.ts file

// UI components defined directly in this file (at the bottom)
// Define cn utility function directly
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

// For FcGoogle icon, we'll create a simple placeholder component
const FcGoogle: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => (
  <div {...props} className={`flex items-center justify-center w-6 h-6 rounded-full bg-white ${props.className || ''}`}>
    <span className="text-xs font-bold text-blue-500">G</span>
  </div>
);

interface LoginFormProps {
  className?: string;
}

interface FormErrors {
  email: string;
  password: string;
  general: string;
  googleSignIn: string;
}

const LoginForm: React.FC<LoginFormProps> = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    password: "",
    general: "",
    googleSignIn: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [redirecting, setRedirecting] = useState<boolean>(false);
  
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => /\S+@\S+\.\S+/.test(email);

  // Handle Google login
  const handleGoogleLogin = async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();
      
      // Store user data in localStorage
      const expirationTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      
      localStorage.setItem("uid", user.uid);
      localStorage.setItem("idToken", idToken);
      localStorage.setItem("userEmail", user.email || "");
      localStorage.setItem("profilePic", user.photoURL || "");
      localStorage.setItem("authExpiration", expirationTime.toString());      
      localStorage.setItem("lastVisitedPage", "/chat");
      
      // Check if user exists in Firebase Realtime Database
      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        // If user doesn't exist, add to Firebase Realtime Database
        await set(userRef, {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
        });
      }
      
      setRedirecting(true);
      setTimeout(() => navigate("/chat", { replace: true }), 1500);
    } catch (error) {
      console.error("Google sign-in error:", error);
      setErrors({
        ...errors,
        googleSignIn: "Google Sign-In failed. Please try again.",
      });
      setTimeout(() => setErrors((prev) => ({ ...prev, googleSignIn: "" })), 3000);
      setLoading(false);
    }
  };

  // Handle form submission for email/password login
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    // Reset errors
    const validationErrors = { ...errors, email: "", password: "", general: "" };
    let isValid = true;
    
    // Validate email
    if (!email.trim()) {
      validationErrors.email = "Email is required.";
      isValid = false;
    } else if (!validateEmail(email)) {
      validationErrors.email = "Enter a valid email.";
      isValid = false;
    }
    
    // Validate password
    if (!password.trim()) {
      validationErrors.password = "Password is required.";
      isValid = false;
    }
    
    setErrors(validationErrors);
    
    if (!isValid) {
      setTimeout(() => {
        setErrors((prev) => ({ ...prev, email: "", password: "", general: "" }));
      }, 3000);
      return;
    }
    
    setLoading(true);
    
    try {
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();
      
      // Store user data in localStorage
      const expirationTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      
      localStorage.setItem("uid", user.uid);
      localStorage.setItem("idToken", idToken);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("authExpiration", expirationTime.toString());      localStorage.setItem("lastVisitedPage", "/chat");
      
      setRedirecting(true);
      setTimeout(() => navigate("/chat", { replace: true }), 1500);
    } catch (error: unknown) {
      const err = error as { code?: string, message?: string };
      console.error("Login error:", err);
      
      // Handle specific Firebase auth errors
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setErrors({ ...errors, general: "Invalid email or password" });
      } else if (err.code === "auth/too-many-requests") {
        setErrors({ ...errors, general: "Too many failed login attempts. Please try again later." });
      } else {
        setErrors({ ...errors, general: "Login failed. Please try again." });
      }
      
      setTimeout(() => {
        setErrors((prev) => ({ ...prev, email: "", password: "", general: "" }));
      }, 3000);
    }
    
    setLoading(false);
  };

  return (    <div className="dark min-h-screen flex items-center justify-center px-4 py-8 bg-background">
      <div className="mx-auto w-full max-w-md rounded-lg bg-card/95 backdrop-blur-sm p-4 md:rounded-2xl md:p-8 border border-border/50 shadow-lg">
        <div className="w-full flex justify-center">
          {/* <div className="text-3xl font-bold text-primary">Wattiy</div> */}
          <img src={Wattify} alt="Wattify Logo" className="w-54 h-20"/>
        </div>
        
        <h2 className="text-3xl text-center font-bold text-foreground mt-5">
          Welcome Back
        </h2>

        <form className="my-8" onSubmit={handleSubmit}>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              placeholder="example@gmail.com"
              type="text"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </LabelInputContainer>
          
          <LabelInputContainer className="mb-4">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="Password*"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </LabelInputContainer>

          {errors.general && (
            <p className="text-red-500 text-xs mb-2">{errors.general}</p>
          )}

          {/* <p className="text-blue-400">
            <Link to="/forgot-password" className="text-cta-bluegreen">
              Forgot password?
            </Link>
          </p> */}          
          <button
            className="cursor-pointer group/btn mt-5 relative block h-10 w-full rounded-lg bg-primary font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Processing...
              </span>
            ) : (
              <>
                Login
                <BottomGradient />
              </>
            )}
          </button>

          {/* <p className="text-white mt-4 text-center cursor-pointer">
            Don't have an account yet?{" "}
            <Link to="/signup" className="text-cta-bluegreen">
              Sign up Here
            </Link>
          </p> */}

          <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

          {errors.googleSignIn && (
            <p className="text-red-500 text-xs mb-2 text-center">
              {errors.googleSignIn}
            </p>
          )}

          <div className="flex flex-col space-y-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="cursor-pointer group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-[#0e1a1c] px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
            >
              <FcGoogle className="text-2xl" />
              <span className="text-sm text-white dark:text-neutral-300">
                Continue with Google
              </span>
              <BottomGradient />
            </button>
          </div>
        </form>
      </div>

      {redirecting && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-lg font-semibold text-white">
              Redirecting...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// UI Components
// Define the Label and Input components
interface LabelProps {
  htmlFor: string;
  children: React.ReactNode;
}

const Label: React.FC<LabelProps> = ({ htmlFor, children }) => {
  return (
    <label 
      htmlFor={htmlFor}
      className="text-sm font-medium text-neutral-300"
    >
      {children}
    </label>
  );
};

// Just use the base interface directly
type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input: React.FC<InputProps> = (props) => {
  return (
    <input
      {...props}
      className="h-10 rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
    />
  );
};

const BottomGradient: React.FC = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

interface LabelInputContainerProps {
  children: React.ReactNode;
  className?: string;
}

const LabelInputContainer: React.FC<LabelInputContainerProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

export default LoginForm;