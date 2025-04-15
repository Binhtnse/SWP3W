import { Layout } from "antd";
import MyContent from "./Content";
import Header from "./Header";
import MyFooter from "./Footer";

const MainLayout = ({children}:{children: React.ReactNode}) => {
    return (
        <Layout className="min-h-screen">
         <Header/>
         <Layout className="flex-1">
            <MyContent>{children}</MyContent>
          </Layout>
         <MyFooter />
       </Layout> 
     );
}

export default MainLayout;