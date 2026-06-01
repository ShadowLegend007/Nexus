import React, { useState, useRef } from 'react';
import useAuthStore from '../../store/authStore';
import { uploadFile } from '../../api/upload';
import { Camera, User, Lock, Save, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import toast from 'react-hot-toast';

export function ProfileSettings() {
  const { user, updateUserAvatar } = useAuthStore();
  const [username, setUsername] = useState(user?.username || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const fileInputRef = useRef(null);

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }

    setUploading(true);
    try {
      const data = await uploadFile(file);
      updateUserAvatar(data.fileUrl);
      toast.success('Avatar updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Avatar upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Username cannot be empty.');
      return;
    }

    setSaving(true);
    // Mimic API save for profile settings demo
    setTimeout(() => {
      setSaving(false);
      toast.success('Profile settings updated!');
    }, 800);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.next || !passwords.confirm) {
      toast.error('Please fill in all password fields.');
      return;
    }

    if (passwords.next !== passwords.confirm) {
      toast.error('New passwords do not match.');
      return;
    }

    setSaving(true);
    // Mimic API save for password change
    setTimeout(() => {
      setSaving(false);
      setPasswords({ current: '', next: '', confirm: '' });
      toast.success('Password changed successfully!');
    }, 1000);
  };

  return (
    <div className="space-y-8 w-full max-w-md mx-auto">
      {/* Avatar Section */}
      <div className="flex flex-col items-center space-y-3">
        <div className="relative cursor-pointer group" onClick={handleAvatarClick}>
          <Avatar src={user?.avatar} name={user?.username} size="xl" className="border-2 border-primary/50 shadow-lg" />
          
          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {uploading ? (
              <RefreshCw className="animate-spin text-white" size={24} />
            ) : (
              <Camera className="text-white" size={24} />
            )}
          </div>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        <span className="text-xs text-text-secondaryDark font-semibold">Click to upload avatar image</span>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleProfileSave} className="space-y-4">
        <h3 className="text-sm font-bold text-text-primaryDark uppercase tracking-wider flex items-center dark:text-text-primaryDark light:text-text-primaryLight">
          <User size={16} className="mr-2 text-primary" />
          Account Details
        </h3>

        <div>
          <label className="block text-xs font-semibold text-text-secondaryDark mb-2 dark:text-text-secondaryDark light:text-text-secondaryLight">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-surface-dark2 border border-border-dark text-text-primaryDark rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all dark:bg-surface-dark2 dark:border-border-dark dark:text-text-primaryDark light:bg-surface-light2 light:border-border-light light:text-text-primaryLight"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondaryDark mb-2 dark:text-text-secondaryDark light:text-text-secondaryLight">
            Email Address (Non-editable)
          </label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full bg-surface-dark/40 border border-border-dark text-text-mutedDark rounded-xl px-4 py-2.5 cursor-not-allowed dark:bg-surface-dark/40 dark:border-border-dark light:bg-surface-light/40 light:border-border-light"
          />
        </div>

        <Button type="submit" variant="primary" loading={saving} className="w-full py-2.5">
          <Save size={16} className="mr-2" />
          Save Changes
        </Button>
      </form>

      {/* Password Form */}
      <form onSubmit={handlePasswordChange} className="space-y-4 border-t border-border-dark pt-6 dark:border-border-dark light:border-border-light">
        <h3 className="text-sm font-bold text-text-primaryDark uppercase tracking-wider flex items-center dark:text-text-primaryDark light:text-text-primaryLight">
          <Lock size={16} className="mr-2 text-primary" />
          Update Password
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-text-secondaryDark mb-2 dark:text-text-secondaryDark light:text-text-secondaryLight">
              Current Password
            </label>
            <input
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              className="w-full bg-surface-dark2 border border-border-dark text-text-primaryDark rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all dark:bg-surface-dark2 dark:border-border-dark dark:text-text-primaryDark light:bg-surface-light2 light:border-border-light light:text-text-primaryLight"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondaryDark mb-2 dark:text-text-secondaryDark light:text-text-secondaryLight">
              New Password
            </label>
            <input
              type="password"
              value={passwords.next}
              onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
              className="w-full bg-surface-dark2 border border-border-dark text-text-primaryDark rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all dark:bg-surface-dark2 dark:border-border-dark dark:text-text-primaryDark light:bg-surface-light2 light:border-border-light light:text-text-primaryLight"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondaryDark mb-2 dark:text-text-secondaryDark light:text-text-secondaryLight">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              className="w-full bg-surface-dark2 border border-border-dark text-text-primaryDark rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all dark:bg-surface-dark2 dark:border-border-dark dark:text-text-primaryDark light:bg-surface-light2 light:border-border-light light:text-text-primaryLight"
            />
          </div>
        </div>

        <Button type="submit" variant="outline" loading={saving} className="w-full py-2.5 border-primary/40 text-primary hover:bg-primary/10">
          Change Password
        </Button>
      </form>
    </div>
  );
}

export default ProfileSettings;
