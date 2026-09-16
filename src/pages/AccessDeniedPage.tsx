import AccessDeniedLayer from "../components/AccessDeniedLayer";

const AccessDeniedPage = () => {
  return (
    <>
      <AccessDeniedLayer />
    </>
  );
};

export default AccessDeniedPage;
export interface Props { readonly id: string; readonly title?: string };
