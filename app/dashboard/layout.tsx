"use client"
import '../globals.css'
import { NavBar } from '../components/nav'

export default  function  Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  //const [userObj, setUserObj] = useState(null)






  return (
   
    <div>
      <NavBar/>
   {children}
     
</div>
       )
}



