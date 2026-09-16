import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import WizardLayer from "../components/WizardLayer";

const WizardPage = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title='Wizard' />

        {/* WizardLayer */}
        <WizardLayer />
      </MasterLayout>
    </>
  );
};

export default WizardPage;
export interface Props { readonly id: string; readonly title?: string };
