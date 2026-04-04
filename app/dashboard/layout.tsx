
import '../globals.css'
import { ContextProvider } from '../Context'
import { currentUser } from '@clerk/nextjs/server'
import InstitutionalPopup from '../components/UserContext'


export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  //const [userObj, setUserObj] = useState(null)
 const userObj =await currentUser()
  return (
   
    <ContextProvider>
   {children}
   {!userObj?.unsafeMetadata?.university && <InstitutionalPopup />}
</ContextProvider>
       

      
  

       
          
       

  )
}



