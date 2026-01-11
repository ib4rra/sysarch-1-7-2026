import React from "react";
import {
  SlidersHorizontal,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

function UserSettingsView({
  passwordData,
  passwordLoading,
  passwordMessage,
  showPasswords,
  setShowPasswords,
  handlePasswordChange,
  handleSavePassword,
  passwordStrength = { score: 0, label: "", color: "" },
  passwordsMatch = false,
}) {
  return (
    <div className="flex justify-center p-6 bg-gray-50 min-h-screen">
      <div className="w-full max-w-4xl space-y-10">
        {/* Password Card */}
        <div className="bg-white rounded-xl shadow-md p-8 relative">
          {/* Icon top-right */}
          <div className="absolute top-6 right-6 p-3 rounded-lg bg-red-50">
            <ShieldCheck size={20} className="text-red-700" />
          </div>

          {/* Header */}
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Change Password
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            Ensure your account is using a long, random password to stay secure.
          </p>

          {/* Error message */}
          {passwordMessage?.type === "error" && (
            <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
              {passwordMessage.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSavePassword} className="space-y-6">
            {/* Current Password */}
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Current Password
              </label>
              <input
                id="currentPassword"
                type={showPasswords ? "text" : "password"}
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full rounded-md border border-gray-300 px-4 py-2.5
                           text-gray-900 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-red-700"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {/* New and Confirm Password */}
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  New Password
                </label>
                <input
                  id="newPassword"
                  type={showPasswords ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full rounded-md border border-gray-300 px-4 py-2.5
                             text-gray-900 placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-red-700"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                {/* Password Strength Indicator */}
                {passwordData.newPassword && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`flex-1 h-1 rounded ${
                            i < passwordStrength.score
                              ? passwordStrength.color
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">
                      Strength: <span className={`font-semibold ${passwordStrength.color.replace('bg-', 'text-')}`}>{passwordStrength.label}</span>
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type={showPasswords ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}

                  className="w-full rounded-md border border-gray-300 px-4 py-2.5
                             text-gray-900 placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-red-700"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                {/* Password Match Indicator */}
                {passwordData.confirmPassword && (
                  <div className="mt-2">
                    {passwordsMatch ? (
                      <p className="text-xs text-green-600 font-semibold">
                        ✓ Passwords match
                      </p>
                    ) : (
                      <p className="text-xs text-red-600 font-semibold">
                        ✗ Passwords do not match
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Show passwords checkbox */}
            <div className="flex items-center space-x-2">
              <input
                id="showPasswords"
                type="checkbox"
                checked={showPasswords}
                onChange={(e) => setShowPasswords(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-red-700 focus:ring-red-700"
              />
              <label
                htmlFor="showPasswords"
                className="text-sm text-gray-600 select-none cursor-pointer"
              >
                Show passwords
              </label>
            </div>

            {/* Save button */}
            <button
              type="submit"
              disabled={passwordLoading}
              className={`inline-flex items-center justify-center rounded-md px-8 py-3
                text-white font-semibold text-sm
                bg-red-800 hover:bg-red-900
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-700
                transition disabled:cursor-not-allowed disabled:bg-gray-300
              `}
            >
              {passwordLoading ? "Saving..." : "Save Password"}
            </button>
          </form>
        </div>

        {/* Privacy & Security */}
        <div className="rounded-lg bg-blue-50 p-6 text-blue-900 border border-blue-200 flex space-x-4">
          <div className="flex-shrink-0">
            <ShieldCheck size={32} className="text-blue-600" />
          </div>
          <div>
            <p className="font-semibold mb-1">Your Data Protection</p>
            <p className="text-sm leading-relaxed">
              Your data is protected and encrypted. We follow all data privacy
              regulations to keep your information safe. Your sensitive PWD
              records are restricted to authorized personnel only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserSettingsView;
