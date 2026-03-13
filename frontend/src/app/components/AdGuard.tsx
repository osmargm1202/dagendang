"use client";

import { useEffect, useState } from "react";

interface AdGuardProps {
  children: React.ReactNode;
}

export default function AdGuard({ children }: AdGuardProps) {
  const [isPremium, setIsPremium] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPremium = async () => {
      const token = localStorage.getItem("user_token") || localStorage.getItem("admin_token");
      if (!token) {
        setIsPremium(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setIsPremium(data.is_premium);
        } else {
          setIsPremium(false);
        }
      } catch (error) {
        console.error("Error checking premium status in AdGuard:", error);
        setIsPremium(false);
      }
    };

    checkPremium();
  }, []);

  // While checking, we hide ads to avoid flicker if they ARE premium
  if (isPremium === null || isPremium === true) {
    return null;
  }

  return <>{children}</>;
}
