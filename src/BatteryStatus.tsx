import React, { useState, useEffect } from "react";
import { BatteryCharging, BatteryFull, BatteryLow, X } from "lucide-react";
import { isWebOrIPhone } from "./utils";

interface BatteryStatusProps {
  showIfBelow?: number; // Optional prop to show battery only if below this level
}

const BatteryStatus: React.FC<BatteryStatusProps> = ({ showIfBelow }) => {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchBatteryStatus = async () => {
      if ("getBattery" in navigator) {
        const battery = await (navigator as any).getBattery();

        // Set initial battery status
        setBatteryLevel(battery.level * 100);
        setIsCharging(battery.charging);
        setTimeRemaining(
          battery.charging
            ? battery.chargingTime / 60 // Convert seconds to minutes
            : battery.dischargingTime / 60
        );

        // Add event listeners for battery status updates
        battery.addEventListener("levelchange", () =>
          setBatteryLevel(battery.level * 100)
        );
        battery.addEventListener("chargingchange", () =>
          setIsCharging(battery.charging)
        );
        battery.addEventListener("dischargingtimechange", () =>
          setTimeRemaining(battery.dischargingTime / 60)
        );
        battery.addEventListener("chargingtimechange", () =>
          setTimeRemaining(battery.chargingTime / 60)
        );
      } else {
        console.error("Battery Status API is not supported on this device.");
      }
    };

    fetchBatteryStatus();
  }, []);

  const getBatteryIcon = () => {
    if (isCharging)
      return <BatteryCharging size={32} className="text-green-500" />;
    if (batteryLevel !== null && batteryLevel > 50)
      return <BatteryFull size={32} className="text-green-500" />;
    return <BatteryLow size={32} className="text-red-500" />;
  };

  const getBatteryTip = () => {
    if (isCharging)
      return "Your device is charging. Keep it plugged in for optimal performance.";
    if (batteryLevel !== null && batteryLevel > 50)
      return "You have sufficient battery to continue using your device.";
    return "Consider charging your device soon to avoid interruptions.";
  };

  // Check if the battery level is above the threshold
  if (
    showIfBelow !== undefined &&
    batteryLevel !== null &&
    batteryLevel >= showIfBelow
  ) {
    return null; // Do not render the component if the battery level is above the threshold
  }

  return (
    <div
      style={{ display: isWebOrIPhone() ? "none" : "block" }}
      className="relative"
    >
      {/* Battery Icon */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center justify-center w-12 h-12 rounded-full  transition"
        title="Battery Status"
        style={{ backgroundColor: "transparent" }} // Transparent background
      >
        {getBatteryIcon()}
      </button>

      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-semibold mb-4">Battery Details</h3>
            <div className="space-y-4">
              <p>
                <strong>Battery Level:</strong>{" "}
                {batteryLevel !== null ? `${batteryLevel.toFixed(0)}%` : "N/A"}
              </p>
              <p>
                <strong>Charging:</strong>{" "}
                {isCharging !== null ? (isCharging ? "Yes" : "No") : "N/A"}
              </p>
              <p>
                <strong>
                  {isCharging ? "Time to Full Charge:" : "Time Remaining:"}
                </strong>{" "}
                {timeRemaining !== null
                  ? `${timeRemaining.toFixed(0)} minutes`
                  : "N/A"}
              </p>
              <p className="text-sm text-gray-600 italic">{getBatteryTip()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatteryStatus;
