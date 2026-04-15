"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/firebase/clientApp";

async function ensureUserDoc(user: User) {
  const userRef = doc(db, "users", user.uid);
  const existingUser = await getDoc(userRef);
  if (!existingUser.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email ?? "",
      createdAt: serverTimestamp(),
    });
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [user, authLoading] = useAuthState(auth);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user && !user.isAnonymous) {
      router.replace("/dashboard");
    }
  }, [authLoading, router, user]);

  const handleAuth = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthMessage("");
    setIsSubmitting(true);

    try {
      if (isSignupMode) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await ensureUserDoc(result.user);
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await ensureUserDoc(result.user);
      }
      router.replace("/dashboard");
    } catch (error) {
      setAuthMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eef2ff_35%,#f8fafc_100%)] p-6">
        <p className="text-sm font-medium text-slate-600">Loading authentication...</p>
      </main>
    );
  }

  if (user && !user.isAnonymous) {
    return null;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eef2ff_35%,#f8fafc_100%)] p-6">
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-slate-300/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-8 h-80 w-80 rounded-full bg-cyan-200/60 blur-3xl" />

      <div className="relative mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_480px]">
        <section className="space-y-5">
          <p className="inline-flex rounded-full border border-slate-300 bg-slate-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-800">
            Welcome to KSN Ticket Hub
          </p>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            Manage events and track ticket performance beautifully
          </h1>
         
          <div className="grid max-w-md grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
              <p className="text-slate-500">Fast Setup</p>
              <p className="mt-1 font-semibold text-slate-900">Create events instantly</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
              <p className="text-slate-500">Live Analytics</p>
              <p className="mt-1 font-semibold text-slate-900">Track ticket sales live</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_30px_70px_-40px_rgba(30,41,59,0.6)] backdrop-blur-md md:p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                {isSignupMode ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-sm text-slate-500">
                {isSignupMode ? "Start managing your events today." : "Sign in to continue to your dashboard."}
              </p>
            </div>
            <Link
              href="/"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Go Back
            </Link>
          </div>

          

          <form onSubmit={handleAuth} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Email
              </label>
              <input
                id="email"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Password
              </label>
              <input
                id="password"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button
              className="mt-1 w-full rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-black hover:to-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Please wait..." : isSignupMode ? "Create Account" : "Sign In"}
            </button>
          </form>

          {authMessage && (
            <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {authMessage}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
