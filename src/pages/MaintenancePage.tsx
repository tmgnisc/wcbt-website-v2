import MaintenanceLayer from "../components/MaintenanceLayer";

const MaintenancePage = () => {
  return (
    <>
      <MaintenanceLayer />
    </>
  );
};

export default MaintenancePage;
export interface Props { readonly id: string; readonly title?: string };
