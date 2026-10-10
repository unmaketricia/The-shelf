import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'The Shelf',description:'A homeschool book wishlist for Mygo, organized by subject.',manifest:'/manifest.webmanifest',appleWebApp:{capable:true,title:'The Shelf',statusBarStyle:'default'},icons:{icon:'/favicon-the-shelf.svg',apple:'/the-shelf-180.png'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
