import ForgotPasswordLayer from "../components/ForgotPasswordLayer";

const ForgotPasswordPage = () => {
  return (
    <>
      {/* ForgotPasswordLayer */}
      <ForgotPasswordLayer />
    </>
  );
};

export default ForgotPasswordPage;
export interface Props { readonly id: string; readonly title?: string };
