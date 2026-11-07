import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'The Shelf',description:'A homeschool book wishlist for Mygo, organized by subject.',manifest:'/manifest.webmanifest',appleWebApp:{capable:true,title:'The Shelf',statusBarStyle:'default'},icons:{icon:[{url:'/shelf-home-palette-v6.ico'},{url:'/shelf-home-palette-v6-32.png',sizes:'32x32',type:'image/png'}],apple:[{url:'/shelf-home-palette-v6-180.png',sizes:'180x180',type:'image/png'}]}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
