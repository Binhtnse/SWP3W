import { Layout } from "antd";
import MyContent from "./Content";
import AdminSidebar from "./AdminSidebar";
import Header from "./Header";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Layout className="min-h-screen">
      <Header />
      <Layout className="flex-1 flex flex-row h-full">
        <AdminSidebar />
        <Layout className="flex-1">
          <MyContent>{children}</MyContent>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
