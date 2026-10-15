export const ENDPOINTS = {
  auth: {
    signInEmail: "/auth/sign-in/email",
    signUpEmail: "/auth/sign-up/email",
    signInSocial: "/auth/sign-in/social",
    signOut: "/auth/sign-out",
    session: "/auth/get-session",
    requestPasswordReset: "/auth/request-password-reset",
    resetPassword: "/auth/reset-password",
    sendVerificationEmail: "/auth/send-verification-email",
  },
  users: {
    list: "/users",
    create: "/users",
    detail: (id: string | number) => `/users/${id}`,
    update: (id: string | number) => `/users/${id}`,
    delete: (id: string | number) => `/users/${id}`,
    avatar: (id: string | number) => `/users/${id}/avatar`,
  },
} as const;
