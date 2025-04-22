import { Layout } from "antd";
import MyContent from "./Content";
import ManagerSidebar from "./ManagerSidebar";


const ManagerLayout = ({children}:{children: React.ReactNode}) => {
    return (
        <Layout className="min-h-screen">
          <ManagerSidebar />
          <Layout className="flex-1">
            <MyContent>{children}</MyContent>
          </Layout>
        </Layout> 
    );
}

export default ManagerLayout;