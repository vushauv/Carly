import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";
import Button from "../Elements/Button/Button";
import Input from "../Elements/Input/Input";
import { useAuthStore } from "../../stores/authStore";
import { API_CONFIG, buildApiUrl, apiRequest } from "../../shared/api.config";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoggedIn } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/kpi");
    }
  }, [isLoggedIn, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError(true);
      setErrorMessage("Please enter both email and password");
      return;
    }

    try {
      setIsLoggingIn(true);
      setError(false);
      setErrorMessage(null);

      const url = buildApiUrl(API_CONFIG.ENDPOINTS.AUTH, 'login');
      const response = await apiRequest<{ userId: number; }>(url, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.userId) {
        login(email);
        navigate("/kpi");
      } else {
        setError(true);
        setErrorMessage("Invalid email or password. Please try again.");
      }
    } catch (err) {
      setError(true);
      setErrorMessage("Login failed. Please check your credentials and try again.");
      console.error("Login failed:", err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <section className={styles.sectionWrapper}>
      <div className={styles.pageHeading}>
        <h2 className={styles.title}>Sign in To Carly</h2>
        <p className={styles.subtitle}>Access your admin dashboard</p>
      </div>

      <fieldset className={styles.formWrapper}>
        <form onSubmit={handleLogin} className={styles.form}>
          {error && (
            <div className={styles.errorArea}>
              <p className={styles.errorMessage}>{errorMessage}</p>
            </div>
          )}

          <div className={styles.inputField}>
            <label htmlFor="email">Email:</label>
            <Input
              id="email"
              type="email"
              hint="Enter your email address"
              errorMessage={error && !email ? "Email is required" : ""}
              className={styles.input}
              isRequired
              value={email}
              onChange={setEmail}
            />
          </div>

          <div className={styles.inputField}>
            <label htmlFor="password">Password:</label>
            <Input
              id="password"
              type="password"
              hint="Enter your password"
              errorMessage={error && !password ? "Password is required" : ""}
              className={styles.input}
              isRequired
              value={password}
              onChange={setPassword}
            />
          </div>

          <div className={styles.buttonGroup}>
            <Button 
              label={isLoggingIn ? "Signing In..." : "Sign In"} 
              type="submit" 
              disabled={isLoggingIn || !email || !password}
            />
          </div>
        </form>
      </fieldset>
    </section>
  );
};

export default LoginPage;
