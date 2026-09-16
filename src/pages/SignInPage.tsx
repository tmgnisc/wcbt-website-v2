import SignInLayer from "../components/SignInLayer";

const SignInPage = () => {
  return (
    <>
      {/* SignInLayer */}
      <SignInLayer />
    </>
  );
};

export default SignInPage;
export interface Props { readonly id: string; readonly title?: string };
