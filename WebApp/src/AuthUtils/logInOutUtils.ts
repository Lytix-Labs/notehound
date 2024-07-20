"use client";

import { signInWithPopup } from "firebase/auth";
import authUtils from "./authUtils";

/**
 * Function to login with google, can be called anywhere to create a popup
 */
async function loginWithGoogle() {
  const response = await signInWithPopup(authUtils.auth, authUtils.provider);
  return response;
}

export const loginUtils = {
  loginWithGoogle,
};

async function logout() {
  await Promise.all([authUtils.auth.signOut()]);
}

export const logoutUtils = {
  logout,
};
