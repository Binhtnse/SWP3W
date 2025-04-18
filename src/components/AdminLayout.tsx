import { Layout } from "antd";
import MyContent from "./Content";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = ({children}:{children: React.ReactNode}) => {
    return (
        <Layout className="min-h-screen">
          <AdminSidebar />
          <Layout className="flex-1">
            <MyContent>{children}</MyContent>
          </Layout>
        </Layout> 
    );
}

export default AdminLayout;