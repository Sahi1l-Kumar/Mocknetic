const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  SIGN_IN_WITH_OAUTH: `signin-with-oauth`,
  DASHBOARD: "/dashboard",
  PROFILE: (id: string) => `/profile/${id}`,
  PROFILE_EDIT: "/profile/edit",
  RESUME: "/resume-parser",
  CODE: "/code-editor",
  SKILL: "/skill-assessment",
  INTERVIEW: "/mock-interview",
};

export default ROUTES;
