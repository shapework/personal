import { useMemo } from "react";
import clsx from "clsx";

interface OptimizedBackgroundProps {
  browsing: string;
  children: React.ReactNode;
  className?: string;
}

// Pre-imported background images for better caching
import info_bg from "/assets/bg_1_resize.jpg";
import chat_bg from "/assets/bg_chat.jpg";

export const OptimizedBackground = ({ browsing, children, className }: OptimizedBackgroundProps) => {
  // Memoize background image to prevent unnecessary re-renders
  const backgroundImage = useMemo(() => {
    return browsing === "Info" ? info_bg : chat_bg;
  }, [browsing]);

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      className={clsx(
        "w-full h-screen flex flex-col items-center justify-between md:py-12 py-6 bg-base-100",
        className
      )}
    >
      {children}
    </div>
  );
};
