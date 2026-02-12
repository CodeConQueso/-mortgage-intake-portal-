// config/site.ts
export const siteConfig = {
  business: {
    name: "Von Borstel Mortgage",
    nmls: "1850", 
    address: "123 Lending Way, Suite 100, Denver, CO 80202",
    phone: "(555) 012-3456",
    email: "vonborstelmanny@gmail.com",
  },
  branding: {
    primaryColor: "blue-600",
    logoText: "Von Borstel Lending",
  },
  hero: {
    headline: "Mortgage Origination Gateway",
    subhead: "Securely submit your loan application and digitally signed authorizations through our high-integrity delivery system.",
    ctaText: "Start Application",
  },
  assets: {
    // High-quality placeholders for showcase
    logo: "https://placehold.co/200x60/2563eb/white?text=VB+LENDING",
    headshot: "https://placehold.co/400x400/e2e8f0/475569?text=LO+Photo", 
    heroBg: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop", 
    ogImage: "https://placehold.co/1200x630/2563eb/white?text=Secure+Loan+Portal",
    equalHousing: "https://placehold.co/100x100/ffffff/000000?text=EHL",
  }
};

export type SiteConfig = typeof siteConfig;
