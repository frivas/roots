import React from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import useClerkLocalization from '../hooks/useClerkLocalization';

interface ClerkAuthWrapperProps {
  type: 'signIn' | 'signUp';
  routing: 'path';
  path: string;
  redirectUrl: string;
}

const ClerkAuthWrapper: React.FC<ClerkAuthWrapperProps> = ({ 
  type, 
  routing, 
  path, 
  redirectUrl 
}) => {
  // Use the improved localization hook that doesn't interfere with Google sign-in
  useClerkLocalization();

  // Madrid styling
  const appearance = {
    elements: {
      formButtonPrimary: "bg-[#ff0000] hover:bg-[#e60000] text-white font-bold font-[Arial,Helvetica,sans-serif] border-0 rounded-md",
      socialButtonsBlockButton: "border border-gray-300 text-gray-700 hover:bg-gray-50 font-[Arial,Helvetica,sans-serif] rounded-md",
      formFieldInput: "border border-gray-300 font-[Arial,Helvetica,sans-serif] focus:border-[#ff0000] focus:ring-1 focus:ring-[#ff0000] rounded-md",
      headerTitle: "font-bold text-black font-[Arial,Helvetica,sans-serif] text-2xl",
      headerSubtitle: "text-gray-600 font-[Arial,Helvetica,sans-serif]",
      footerActionLink: "text-[#ff0000] hover:text-[#e60000] font-[Arial,Helvetica,sans-serif] font-medium",
      card: "shadow-none border-none bg-transparent",
      main: "font-[Arial,Helvetica,sans-serif]",
      dividerLine: "bg-gray-300",
      dividerText: "text-gray-500 font-[Arial,Helvetica,sans-serif]",
      formFieldLabel: "text-gray-700 font-medium font-[Arial,Helvetica,sans-serif]",
      identityPreviewText: "font-[Arial,Helvetica,sans-serif]",
      identityPreviewEditButton: "text-[#ff0000] hover:text-[#e60000] font-[Arial,Helvetica,sans-serif]",
      footerActionText: "text-gray-600 font-[Arial,Helvetica,sans-serif]"
    }
  };

  if (type === 'signIn') {
    return (
      <SignIn 
        routing={routing}
        path={path}
        redirectUrl={redirectUrl}
        appearance={appearance}
      />
    );
  }

  return (
    <SignUp 
      routing={routing}
      path={path}
      redirectUrl={redirectUrl}
      appearance={appearance}
    />
  );
};

export default ClerkAuthWrapper; 