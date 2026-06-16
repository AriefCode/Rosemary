import api from "./api";

export async function login(email, password) {
  const { data } = await api.post("/login", { email, password });
  return data;
}

export async function logout() {
  await api.post("/logout");
}

export async function getMe() {
  const { data } = await api.get("/user");
  return data;
}
