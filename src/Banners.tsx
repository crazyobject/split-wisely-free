import React, { useState, useEffect } from "react";

const Banners: React.FC = () => {
  const banners = [
    "/icons/banners/1.png",
    "/icons/banners/2.png",
    "/icons/banners/3.png",
    "/icons/banners/4.png",
    "/icons/banners/5.png",
  ]; // Add all banner image paths here
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true); // Start fade-out effect
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length); // Switch to the next image
        setFade(false); // Start fade-in effect
      }, 500); // Duration of fade-out effect
    }, 4000); // Switch every 4 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [banners.length]);

  return (
    <div className="mt-8 flex justify-center">
      <div className="w-full max-w-md relative">
        <img
          src={banners[currentIndex]}
          alt={`Banner ${currentIndex + 1}`}
          className={`rounded-lg shadow-lg w-full transition-opacity duration-500 ${
            fade ? "opacity-0" : "opacity-100"
          }`}
        />
      </div>
    </div>
  );
};

export default Banners;
