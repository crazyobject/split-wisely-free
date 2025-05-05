import React from "react";
import { PlusCircle, Trash2, Users } from "lucide-react";
import InputMask from "react-input-mask";
import { Friend } from "./types";
import { validateName, CURRENCIES, isWebOrIPhone } from "./utils";

interface NewExpenseFormProps {
  tripName: string;
  setTripName: React.Dispatch<React.SetStateAction<string>>;
  friends: Friend[];
  setFriends: React.Dispatch<React.SetStateAction<Friend[]>>;
  setCurrency: React.Dispatch<React.SetStateAction<string>>;
  currencySymbol: string;
  setCurrencySymbol: React.Dispatch<React.SetStateAction<string>>;
  dropdownOpen: boolean;
  setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleNewExpense: (e: React.FormEvent) => void;
  openContactPicker: (index: number) => Promise<void>;
}

const NewExpenseForm: React.FC<NewExpenseFormProps> = ({
  tripName,
  setTripName,
  friends,
  setFriends,
  setCurrency,
  currencySymbol,
  setCurrencySymbol,
  dropdownOpen,
  setDropdownOpen,
  handleNewExpense,
  openContactPicker,
}) => {
  return (
    <>
      <form onSubmit={handleNewExpense} className="space-y-6">
        <div className="flex gap-2 items-center">
          {/* Input takes max width */}
          <div className="flex-1">
            <input
              type="text"
              required
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. Team lunch at Poptates"
            />
          </div>

          {/* Currency circle */}
          <div className="relative w-14">
            <button
              type="button"
              onClick={(e) => {
                e?.preventDefault();
                setDropdownOpen(!dropdownOpen);
              }}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-white text-blue-700 font-bold text-2xl border-2 border-blue-500 shadow-md hover:scale-105 transition"
            >
              {currencySymbol}
            </button>

            {dropdownOpen && (
              <ul className="absolute z-50 mt-2 right-0 w-48 bg-white border border-gray-200 rounded-xl shadow-xl py-2 max-h-60 overflow-auto">
                {CURRENCIES.map((curr) => (
                  <li
                    key={curr.code}
                    onClick={() => {
                      setCurrency(curr.code);
                      setCurrencySymbol(curr.symbol);
                      setDropdownOpen(false);
                    }}
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer flex justify-between text-sm"
                  >
                    <span>{curr.symbol}</span>
                    <span className="text-gray-500">{curr.code}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Friends List
          </label>
          {friends.map((friend, index) => (
            <div
              key={friend.id}
              className="flex flex-col sm:flex-row gap-2 items-center"
            >
              <input
                id={`friend-name-${friend.id}`} // Add unique ID
                type="text"
                required
                value={friend.name}
                onChange={(e) => {
                  if (!validateName(e.target.value) && e.target.value !== "")
                    return;
                  const newFriends = [...friends];
                  newFriends[index].name = e.target.value;
                  setFriends(newFriends);
                }}
                className="friendName flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Name"
              />
              <div className="relative flex-1">
                <InputMask
                  mask="+99 999 999 9999"
                  maskChar={null}
                  type="tel"
                  value={friend.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d+]/g, "");
                    const newFriends = [...friends];
                    newFriends[index].phone = value;
                    setFriends(newFriends);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="+1 234 567 8900"
                />
                <button
                  type="button"
                  onClick={() => openContactPicker(index)}
                  className="absolute right-2 top-2 text-blue-600 hover:text-blue-700"
                  title="Select from contacts"
                  style={{ display: isWebOrIPhone() ? "none" : "block" }} // Hide for web and iPhone
                >
                  <Users size={20} />
                </button>
              </div>
              {index > 0 && ( // Render delete button only for rows other than the first one
                <button
                  type="button"
                  onClick={() => {
                    const newFriends = friends.filter((_, i) => i !== index);
                    setFriends(newFriends);
                  }}
                  className="text-red-600 hover:text-red-700"
                  title="Remove Friend"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const newFriend = {
                id: Date.now().toString(),
                name: "",
                phone: "",
              };
              setFriends([...friends, newFriend]);
              setTimeout(() => {
                document.getElementById(`friend-name-${newFriend.id}`)?.focus();
              }, 0); // Delay to ensure the DOM is updated before focusing
            }}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <PlusCircle size={20} /> Add Friend
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
        >
          Continue
        </button>
      </form>
    </>
  );
};

export default NewExpenseForm;
