import React from "react";
import BatteryStatus from "./BatteryStatus";

const Header = ({
  setStep,
}: {
  setStep: React.Dispatch<React.SetStateAction<"new" | "details" | "summary">>;
}) => (
  <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
    <div className="max-w-4xl mx-auto flex items-center justify-between p-2">
      <button onClick={() => setStep("new")}>
        <img src="/icons/mainLogo.png" height="150" width="150" alt="Logo" />
      </button>
      <BatteryStatus showIfBelow={30} />
    </div>
  </header>
);

export default Header;
