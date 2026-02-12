import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      fontFamily: {
        heading: ["Inter", "sans-serif"],
        body: ["Open Sans", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        positive: {
          DEFAULT: "hsl(var(--positive))",
          foreground: "hsl(var(--positive-foreground))",
        },
        negative: {
          DEFAULT: "hsl(var(--negative))",
          foreground: "hsl(var(--negative-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        alert: {
          DEFAULT: "hsl(var(--alert))",
          foreground: "hsl(var(--alert-foreground))",
        },
        "chart-company": "hsl(var(--chart-company))",
        "chart-market": "hsl(var(--chart-market))",
        grayscale: {
          "0": "hsl(var(--grayscale-0))",
          "5": "hsl(var(--grayscale-5))",
          "10": "hsl(var(--grayscale-10))",
          "20": "hsl(var(--grayscale-20))",
          "30": "hsl(var(--grayscale-30))",
          "40": "hsl(var(--grayscale-40))",
          "50": "hsl(var(--grayscale-50))",
          "60": "hsl(var(--grayscale-60))",
          "70": "hsl(var(--grayscale-70))",
          "80": "hsl(var(--grayscale-80))",
          "90": "hsl(var(--grayscale-90))",
          "100": "hsl(var(--grayscale-100))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      spacing: {
        "xxs": "4px",
        "xs": "8px",
        "sm-space": "12px",
        "default-space": "16px",
        "md-space": "20px",
        "xmd": "24px",
        "big": "32px",
        "xbig": "40px",
        "xxbig": "48px",
        "huge": "56px",
        "xhuge": "64px",
        "xxhuge": "72px",
      },
      borderRadius: {
        "xxs": "1px",
        "xs-r": "2px",
        "sm-r": "3px",
        md: "4px",
        lg: "6px",
        "xxl": "10px",
        "huge": "15px",
      },
      boxShadow: {
        "dp01": "var(--shadow-dp01)",
        "dp02": "var(--shadow-dp02)",
        "dp04": "var(--shadow-dp04)",
        "dp08": "var(--shadow-dp08)",
        "dp12": "var(--shadow-dp12)",
        "dp16": "var(--shadow-dp16)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
