import client from "./axios";

export const login = async (email: string, password: string) => {
  const response = await client.post("/auth/login", { email, password });
  return response.data; // Retorna { access_token, user }
};

export const register = async (
  name: string,
  email: string,
  password: string,
) => {
  const response = await client.post("/auth/register", {
    name,
    email,
    password,
  });
  return response.data;
};
