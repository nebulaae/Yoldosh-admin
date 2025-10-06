"use client"

import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

export const ThemeProviders = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div style={{ visibility: "hidden" }}>{children}</div>;
    }

    return (
        <ThemeProvider attribute="class" defaultTheme="light">
            {children}
        </ThemeProvider>
    );
};