import { useState } from "react";
import { Button, PasswordInput, TextInput } from "@mantine/core";

import { loginUser } from "../services/authService";

import { useAuthStore } from "../stores/authStore";

export default function LoginPage() {
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await loginUser(
        email,
        password
      );

      login(
        response.data.token,
        response.data.user
      );

      alert("Login successful");
    } catch (error) {
      alert("Invalid credentials");
    }
  };

  return (
    <div>
      <TextInput
        label="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <PasswordInput
        label="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <Button mt="md" onClick={handleLogin}>
        Login
      </Button>
    </div>
  );
}