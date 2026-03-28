import { AuthUser } from "@/lib/types";
import CustomInput from "../ui/shared/CustomInput";
import { Loader2, Search, UserIcon } from "lucide-react";
import { capitalizeFirstLetter, handleKeyDown } from "@/lib/utils";
import UserAvatarWithFallback from "../ui/shared/UserAvatarWithFallback";
import ProfileCard from "../ui/shared/ProfileCard";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import ToastNotification, { Toast } from "@/components/ui/shared/ToastNotification";
import ConfirmationModal from "../ui/shared/ConfirmModal";

type UserRole = "admin" | "moderator" | "alumni" | "member" | "guest";

const RolesManagement = () => {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [searchIdentifier, setSearchIdentifier] = useState("");
  const [searchedUser, setSearchedUser] = useState<AuthUser | null>(null);
  const [editedRole, setEditedRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const roles: UserRole[] = ["admin", "moderator", "alumni", "member", "guest"];

  // --- Handlers for Role Management Tab ---

  const handleUserSearch = async () => {
    if (!searchIdentifier) return;
    let res;
    try {
      setLoading(true);
      setSearchedUser(null);
      setEditedRole(null);
      setError(null);

      res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/profile/${searchIdentifier}`,
        { withCredentials: true }
      );
      setSearchedUser(res.data.data);
    } catch (err: unknown) {
      console.error("User search error:", err);
      if (err instanceof AxiosError) {
        setError(err?.response?.data?.message || "An error occurred");
      } else {
        setError("Something went wrong!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (val: string) => {
    setEditedRole(val as UserRole);
  };

  const handleSaveRole = async () => {
    console.log("editedRole: ", editedRole);
    if (!searchedUser || editedRole === null) return;
    if (searchedUser.role === editedRole) {
      setToast({ message: "Role not changed", type: "warning" });
      console.log("toast should run: ", toast);
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmRoleChange = async () => {
    if (!searchedUser || editedRole === null) return;

    // Close the modal and start loading
    setIsModalOpen(false);
    setLoading(true);

    let res;
    try {
      setLoading(true);

      res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/admin/update/${searchedUser._id}`,
        { role: editedRole },
        { withCredentials: true }
      );
      console.log("res: ", res.data);
      setSearchedUser((prev) => ({ ...prev!, role: editedRole }));
      setToast({
        message: `Role updated to ${editedRole} for ${searchedUser.fullName}`,
        type: "success",
      });
    } catch (error) {
      console.log("Error updating role: ", error);
      setToast({ message: "Error updating role", type: "error" });
    } finally {
      setLoading(false);
      setIsEditing(null);
    }
  };

  const handleDiscardRole = () => {
    if (searchedUser) {
      setEditedRole(searchedUser.role);
    }
    setIsEditing(null);
  };
  const handleEdit = (section: string) => {
    setIsEditing(section);
  };

  const clearToast = () => {
    setToast(null);
  };

  return (
    <div className="space-y-6">
      {/* --- 1. Search Bar & Button --- */}
      <p className="text-gray-600 dark:text-gray-400">
        Search for a user by email, student ID, or club ID to update their role.
      </p>
      <div className="flex space-x-4 items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        <CustomInput
          type="text"
          value={searchIdentifier}
          onChange={(e) => setSearchIdentifier(e.target.value)}
          placeholder="Search by Email, Student ID, or Club ID..."
          onKeyDown={(e) => handleKeyDown(e, handleUserSearch)}
          className="w-full max-w-lg border border-gray-300 dark:border-gray-600 p-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm focus:outline-none"
          disabled={loading}
        />
        <button
          onClick={handleUserSearch}
          disabled={loading}
          // Class changes: More rounded, distinct hover effect
          className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition flex items-center shadow-md hover:shadow-lg disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Search className="w-5 h-5 mr-2" />
          )}
          Search
        </button>
      </div>

      {error && <p className="text-red-500 dark:text-red-400 font-medium ml-2">{error}</p>}

      {/* --- 2. User Profile Card (Result Section) --- */}
      {(searchedUser || loading) && (
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h4 className="text-2xl font-bold mb-6 border-b pb-3 text-gray-900 dark:text-white">
            {loading ? "Searching..." : "User Profile Found"}
          </h4>

          {!searchedUser && loading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading user details...</p>
          ) : (
            searchedUser && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- Column 1: Avatar and Quick Info (Tighter Design) --- */}
                <div className="lg:col-span-1 bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                  <div className="mx-auto w-32 h-32 mb-4 relative rounded-full overflow-hidden border-4 border-blue-500 dark:border-blue-400">
                    <UserAvatarWithFallback
                      initialImageUrl={searchedUser?.imageUrl}
                      fullName={searchedUser?.fullName || "profile image"}
                      w={128}
                      h={128}
                    />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {searchedUser?.fullName}
                  </h2>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {capitalizeFirstLetter(searchedUser?.role)}
                  </p>

                  <div
                    className={`mt-3 py-1 px-3 inline-flex text-xs rounded-full font-semibold ${
                      searchedUser?.profileStatus === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    }`}
                  >
                    {capitalizeFirstLetter(searchedUser?.profileStatus)}
                  </div>
                </div>

                {/* --- Column 2: Role Modification Card --- */}
                <div className="lg:col-span-2 space-y-6">
                  <ProfileCard
                    title="Role & Status Modification"
                    icon={UserIcon}
                    sectionKey="roleEditingSection"
                    canEdit={true}
                    isEditing={isEditing}
                    onEdit={handleEdit}
                    onSave={handleSaveRole}
                    onCancel={handleDiscardRole}
                    loading={loading}
                  >
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        {/* Basic Info (Non-Editable) */}
                        <div>
                          <p className="font-medium text-sm text-gray-500 dark:text-gray-400">
                            Email
                          </p>
                          <p className="text-gray-800 dark:text-gray-200">{searchedUser?.email}</p>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-500 dark:text-gray-400">
                            Student ID
                          </p>
                          <p className="text-gray-800 dark:text-gray-200">
                            {searchedUser?.studentId}
                          </p>
                        </div>
                      </div>

                      {/* Role Editing Section */}
                      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Current Role:
                          <span className="ml-2 px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 rounded-full text-sm font-bold">
                            {capitalizeFirstLetter(searchedUser?.role)}
                          </span>
                        </p>

                        {/* Dropdown and Action Buttons */}
                        <div className="flex items-start space-x-4">
                          {isEditing === "roleEditingSection" ? (
                            <div className="flex flex-col space-y-2">
                              <label
                                htmlFor="user-role"
                                className="font-medium text-gray-600 dark:text-gray-400 text-sm"
                              >
                                Select New Role:
                              </label>
                              <select
                                id="user-role"
                                value={editedRole || searchedUser.role}
                                onChange={(e) => handleRoleChange(e.target.value)}
                                disabled={loading}
                                // Class changes: Larger size, better focus styling
                                className="p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition shadow-sm w-48"
                              >
                                {roles.map((role) => (
                                  <option key={role} value={role}>
                                    {capitalizeFirstLetter(role)}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <div className="text-gray-500 dark:text-gray-400 italic">
                              Click the pencil icon to modify the role.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </ProfileCard>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* --- Confirmation Modal --- */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmRoleChange}
        title="Confirm Role Change"
        confirmText="Update Role"
        confirmColor="blue" // Since this is a role change, blue/green might be better than destructive red
        loading={loading}
        message={
          <>
            You are about to change the role of
            <span className="font-bold text-gray-900 dark:text-white mx-1">
              {searchedUser?.fullName}
            </span>
            from
            <span className="font-bold text-yellow-600 dark:text-yellow-400 mx-1">
              {searchedUser?.role}
            </span>
            to
            <span className="font-bold text-blue-600 dark:text-blue-400 mx-1">{editedRole}</span>.
            <p className="mt-2 text-sm text-red-500">
              This action may grant or remove administrative privileges.
            </p>
          </>
        }
      />

      {toast && (
        <ToastNotification type={toast.type} message={toast.message} onClose={clearToast} />
      )}
    </div>
  );
};

export default RolesManagement;
