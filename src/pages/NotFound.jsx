
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import HeaderNav from '@/components/HeaderNav';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderNav />
      <main className="flex-1 container py-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-7xl font-bold mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Oops! This page doesn't exist
          </p>
          <Button onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
