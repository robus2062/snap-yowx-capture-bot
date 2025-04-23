
import React from 'react';

const Header = () => {
  return (
    <header className="w-full bg-gradient-yowx p-4 md:p-6 flex justify-center items-center shadow-lg">
      <div className="text-center">
        <h1 className="text-2xl md:text-4xl font-bold text-white tracking-wide">
          Yowx Mods IPA
        </h1>
        <p className="text-sm md:text-base text-yowx-light mt-2 max-w-md">
          Instant photo authentication for your modified apps
        </p>
      </div>
    </header>
  );
};

export default Header;
