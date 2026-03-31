
import '../globals.css'
import { ContextProvider } from '../Context'




export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
   
    <ContextProvider>
   {children}
</ContextProvider>
       

      
  

       
          
       

  )
}



