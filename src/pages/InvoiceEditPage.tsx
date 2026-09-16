import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import InvoiceEditLayer from "../components/InvoiceEditLayer";

const InvoiceEditPage = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title='Invoice - Edit' />

        {/* InvoiceEditLayer */}
        <InvoiceEditLayer />
      </MasterLayout>
    </>
  );
};

export default InvoiceEditPage;
export interface Props { readonly id: string; readonly title?: string };
