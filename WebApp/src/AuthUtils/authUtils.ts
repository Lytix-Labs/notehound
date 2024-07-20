"use client";

import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { firebaseConfig } from "./firebaseConfig";

initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({});
const auth = getAuth();

let authInit = false;
auth.onAuthStateChanged((next) => {
  authInit = true;
});

const authNew = () => {
  return getAuth();
};

const isLoggedIn = async (): Promise<string | false> => {
  return false;
};

const getUserInfo = async () => {
  while (!authInit) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  const user = auth.currentUser;
  if (user) {
    return { userEmail: user.email };
  }
};

const authUtils = {
  provider,
  auth,
  authNew,
  isLoggedIn,
  getUserInfo,
};

export default authUtils;
