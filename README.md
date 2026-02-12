# Secure Mortgage Origination Gateway

A bank-grade, non-custodial portal for mortgage document intake and electronic authorizations.

## 🚀 Live Activation (Simple Guide)

Since this portal is designed to send emails directly to your loan officer, **you do not need a website or a domain** to go live.

### 1. Setup the Email Bridge
1.  Sign up for a free account at [Resend.com](https://resend.com) using your Gmail.
2.  Copy your **API Key** from the Resend dashboard.
3.  Add it to your environment:
    *   **Locally**: Add `RESEND_API_KEY=re_your_key` to your `.env.local` file.
    *   **On Vercel**: Add `RESEND_API_KEY` to your project's Environment Variables.

### 2. Deployment
Simply connect this folder to a **Vercel** or **Netlify** account. It will automatically detect the `/api` route and handle the secure relay.

---

## 🛠 Features
- **Zero-Retention Architecture**: Sensitive PII is purged immediately after relay.
- **High-Fidelity PDF Generation**: Produces a 3-page signed compliance bundle.
- **FNM 3.2 Export**: Generates industry-standard data files for software import.
- **Borrower-Centric UX**: Auto-formatting and tactile feedback for a frictionless experience.
- **ADA Compliant**: Focus-aware signatures and screen-reader optimizations.

## 💻 Local Testing
1. `npm install`
2. `npm run dev`
3. Use the **"Auto-Fill"** button in the wizard to test the full 3-page PDF and FNM delivery in seconds.
