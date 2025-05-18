import {Outlet} from 'react-router-dom'
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from './AppSidebar'; 

const AppLayout = () => { 
  return (
    <div className="dark min-h-screen bg-background">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className='max-w-full min-h-screen bg-background/95 backdrop-blur-sm'>
            <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </div>
  ) 
}

export default AppLayout;
