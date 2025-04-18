import { Layout } from "antd";
import MyContent from "./Content";
import Header from "./Header";
import MyFooter from "./Footer";

const MainLayout = ({children}:{children: React.ReactNode}) => {
    return (
        <Layout className="min-h-screen">
         <Header />
         <Layout className="flex-1">
            <div className="mx-auto w-full max-w-7xl my-6">
              <MyContent>{children}</MyContent>
            </div>
          </Layout>
         <MyFooter />
       </Layout> 
     );
}

export default MainLayout;