"use client";

import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { firebaseConfig } from "./firebaseConfig";

initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();
const auth = getAuth();

async function getFirebaseIdToken() {
  const authLogin = getAuth();
  let currentUser = null;
  let retries = 0;
  while (currentUser === null) {
    retries += 1;
    if (retries > 10) {
      throw new Error(`No firebaseId`);
    }

    currentUser = authLogin.currentUser;
    if (currentUser === null) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
  const token = await currentUser!.getIdToken();
  return token;
}

export default getFirebaseIdToken;
