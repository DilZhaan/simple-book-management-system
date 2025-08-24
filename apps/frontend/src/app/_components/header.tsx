'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useRouter } from 'next/navigation';
import { useAuth } from '../_context/AuthContext';
import '../assets/header.css';

export default function Header() {
  const [value, setValue] = React.useState(0);
  const { isSignedIn, logout, user } = useAuth();
  const router = useRouter();

  const tabs = React.useMemo(() => {
    //I used Tabs array cuz when using tabs directly, we can use signIn n signup btns 
    const baseTabs = [
      { label: 'Home', path: '/' },
      { label: 'Books', path: '/books' }
    ];

    if (isSignedIn) {
      baseTabs.push({ 
        label: `Logout (${user?.username || 'User'})`, 
        path: 'logout' 
      });
    } else {
      baseTabs.push(
        { label: 'Sign In', path: '/auth/signin' },
        { label: 'Sign Up', path: '/auth/signup' }
      );
    }

    return baseTabs;
  }, [isSignedIn, user?.username]);

  const handleTabClick = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    
    console.log('Tab clicked:', newValue, 'Path:', tabs[newValue]?.path);
    
    const selectedTab = tabs[newValue];
    
    if (selectedTab?.path === 'logout') {
      console.log('Logging out'); 
      logout();
      setValue(0); 
      router.push('/');
    } else if (selectedTab?.path) {
      console.log('Navigating to:', selectedTab.path); 
      router.push(selectedTab.path);
    }
  };

  return (
    <Box 
      sx={{ width: '100%', bgcolor: 'background.paper' }}
      className="header-container"
    >
      <Tabs 
        value={value} 
        onChange={handleTabClick} 
        centered
        className="header-tabs"
      >
        {tabs.map((tab, index) => {
          const isLogout = tab.path === 'logout';
          const isAuth = tab.path === '/auth/signin' || tab.path === '/auth/signup';
          
          return (
            <Tab 
              key={index} 
              label={tab.label}
              className="header-tab"
              data-logout={isLogout}
              data-auth={isAuth}
            />
          );
        })}
      </Tabs>
    </Box>
  );
}