const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const authService = {
  /**
   * Sign up new user
   */
  async signup(userData) {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Signup failed");
    }

    // Store token in sessionStorage
    if (data.accessToken) {
      sessionStorage.setItem("accessToken", data.accessToken);
    }

    return data;
  },

  /**
   * Sign in user
   */
  async signin(credentials) {
    const response = await fetch(`${API_URL}/api/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Sign in failed");
    }

    // Store token in sessionStorage
    if (data.accessToken) {
      sessionStorage.setItem("accessToken", data.accessToken);
    }

    // Return full response (consistent with signup)
    return data;
  },

  /**
   * Sign out user
   */
  // Provide both `logout` and `signout` names for compatibility
  async logout() {
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
      },
      credentials: "include",
    });

    // Clear token regardless of response
    sessionStorage.removeItem("accessToken");

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Logout failed");
    }

    return true;
  },

  async signout() {
    return await this.logout();
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    const token = sessionStorage.getItem("accessToken");

    if (!token) {
      throw new Error("No token found");
    }

    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to get user");
    }

    return data.user;
  },

  /**
   * Forgot password
   */
  async forgotPassword(email) {
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to send reset code");
    }

    return data;
  },

  /**
   * Reset password
   */
  async resetPassword(resetData) {
    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(resetData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to reset password");
    }

    return data;
  },
};

export default authService;
