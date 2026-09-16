import ComingSoonLayer from "../components/ComingSoonLayer";

const ComingSoonPage = () => {
  return (
    <>
      <ComingSoonLayer />
    </>
  );
};

export default ComingSoonPage;
export interface Props { readonly id: string; readonly title?: string };
