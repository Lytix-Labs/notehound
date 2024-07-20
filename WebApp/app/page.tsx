"use client";

import { loginUtils } from "@/AuthUtils/logInOutUtils";
import { Icons } from "@/components/Icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import HttpClientInstance from "@/httpClient/HttpClient";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "./globals.css";

/**
 * @param {string} name The cookie name.
 * @return {?string} The corresponding cookie value to lookup.
 */
export function getCookie(name: string) {
  var v = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
  return v ? v[2] : null;
}

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    try {
      setIsLoading(true);

      const userInfoFirebase = await loginUtils.loginWithGoogle();
      const idToken = await userInfoFirebase.user.getIdToken();
      const csrfToken = getCookie("_xsrf");

      try {
        await HttpClientInstance.getGoogleCookie(idToken, csrfToken);
      } catch (err) {
        throw err;
      }

      router.push("/home/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something went wrong.",
        description: "Please try again.",
      });
      setIsLoading(false);
    }
  }
  return (
    <div className="bg-slate-800 w-screen h-screen flex items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Notes</CardTitle>
          <CardDescription className="text-center">By Lytix</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <Button
            variant="outline"
            type="button"
            disabled={isLoading}
            onClick={onSubmit}
          >
            {isLoading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 h-4 w-4" />
            )}{" "}
            Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
