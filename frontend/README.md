# PCL-MAS Frontend

React + Vite + Tailwind CSS client for the Personalized Collaborative Learning MAS platform (mobile-first).

## Stack

React 19, Vite, Tailwind CSS v4 (`@tailwindcss/vite`, CSS-first `@theme` tokens in `src/index.css`), react-router-dom, lucide-react (auth UI icons only).

## Structure

```
src/
  components/
    icons.jsx        shared line-icon set (landing page)
    ui/               Button, Container, SectionHeading primitives
    layout/           Navbar, Footer
    landing/          Hero, FeaturesSection, AITeamSection, HowItWorksSection,
                       ProductPreviewSection, ResearchSection, CTA
    auth/             FormError, AuthInput, PasswordInput, PasswordStrength,
                       AuthButton, AuthFooter, AuthHeader, AuthCard, AuthLayout,
                       StepIndicator, LoginForm, MultiStepAuthForm, previews/
  pages/
    LandingPage.jsx
    student/          StudentLogin, StudentRegister, StudentDashboard
    lecturer/         LecturerLogin, LecturerRegister, LecturerDashboard
    admin/            AdminLogin, AdminDashboard
  routes/AppRoutes.jsx  all route definitions + catch-all redirect
  services/authService.js  single point of contact with the backend auth API
  utils/password.js    password requirement rules shared by register + login UI
  data/                static landing-page content
```

`App.jsx` renders `<AppRoutes />`; `main.jsx` wraps it in `<BrowserRouter>`.

## Running

```
npm install
npm run dev      # Vite dev server, http://localhost:5173
npm run build
npm run lint
```

Optional `VITE_API_BASE_URL` env var overrides the backend base URL (defaults to `http://localhost:4000/api/v1`).

## Backend contract

`src/services/authService.js` calls the backend's unified auth endpoints (`POST /auth/register`, `POST /auth/login`, `GET /auth/me`) and unwraps the standard `{ success, data, message }` / `{ success, message, error }` response envelope documented in `backend/README.md` and its Swagger UI (`http://localhost:4000/api/v1/docs`). The session (`{ user, accessToken }`) is stored in `localStorage` under `pclmas.session`.

## Design system

Brand palette: black/white/gray, color used sparingly for success/warning/error/accent states. Mobile-first: large touch targets, bottom-nav-friendly layouts. See `Docs/design/` for the full design reference.
