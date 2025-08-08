import Layout from "./Layout.jsx";

import Chat from "./Chat";

import KnowledgeBase from "./KnowledgeBase";

import Admin from "./Admin";

import FAQ from "./FAQ";

import Video from "./Video";

import Calculator from "./Calculator";

import Profile from "./Profile";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Chat: Chat,
    
    KnowledgeBase: KnowledgeBase,
    
    Admin: Admin,
    
    FAQ: FAQ,
    
    Video: Video,
    
    Calculator: Calculator,
    
    Profile: Profile,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Chat />} />
                
                
                <Route path="/Chat" element={<Chat />} />
                
                <Route path="/KnowledgeBase" element={<KnowledgeBase />} />
                
                <Route path="/Admin" element={<Admin />} />
                
                <Route path="/FAQ" element={<FAQ />} />
                
                <Route path="/Video" element={<Video />} />
                
                <Route path="/Calculator" element={<Calculator />} />
                
                <Route path="/Profile" element={<Profile />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}