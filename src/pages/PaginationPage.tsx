import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import PaginationLayer from "../components/PaginationLayer";

const PaginationPage = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title='Components / Pagination' />

        {/* PaginationLayer */}
        <PaginationLayer />
      </MasterLayout>
    </>
  );
};

export default PaginationPage;
export interface Props { readonly id: string; readonly title?: string };
