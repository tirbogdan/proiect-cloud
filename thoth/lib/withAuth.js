import { verifyAuth } from "./auth";

export function withAuth(getServerSidePropsFunc) {
  return async (context) => {
    const { req } = context;
    const isAuthenticated = verifyAuth(
      req.headers.cookie || "",
      process.env.JWT_SECRET
    );

    if (!isAuthenticated) {
      return {
        redirect: {
          destination: "/auth",
          permanent: false,
        },
      };
    }

    if (getServerSidePropsFunc) {
      return await getServerSidePropsFunc(context);
    }

    return {
      props: {},
    };
  };
}
