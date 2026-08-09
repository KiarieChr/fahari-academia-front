import React, { useState } from 'react';
import { Camera, X, Loader2, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '../../../services/api';
import LazyImage from '../../../components/common/LazyImage';

/**
 * ProfilePictureUpload component
 * Allows users to upload and preview their profile picture
 * Integrated into MyAccount
 */
const ProfilePictureUpload = ({ currentAvatar, onUploadSuccess }) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentAvatar);
    const [hovering, setHovering] = useState(false);
    const inputRef = React.useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target.result);
        };
        reader.readAsDataURL(file);

        // Upload
        await uploadProfilePicture(file);
    };

    const uploadProfilePicture = async (file) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await api.post('/api/users/upload_avatar/', formData, {
                responseType: 'json'
            });

            toast.success('Profile picture updated successfully');
            if (onUploadSuccess) {
                onUploadSuccess(response);
            }
        } catch (error) {
            toast.error('Failed to upload profile picture');
            console.error(error);
            // Reset preview on error
            setPreview(currentAvatar);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <div
                className="relative w-32 h-32 mx-auto"
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
            >
                {/* Avatar Display */}
                <div className="relative w-full h-full rounded-xl overflow-hidden border-4 border-indigo-100 shadow-lg bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
                    {preview ? (
                        <LazyImage
                            src={preview}
                            alt="Profile"
                            aspectRatio="aspect-square"
                            className="w-full h-full"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                            <Camera size={32} className="opacity-50" />
                            <span className="text-xs mt-2 font-medium">No photo</span>
                        </div>
                    )}

                    {/* Upload Overlay */}
                    {hovering && !uploading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg transition-all">
                            <label className="cursor-pointer flex flex-col items-center justify-center gap-2">
                                <Upload size={24} className="text-white" />
                                <span className="text-white text-xs font-semibold">Change Photo</span>
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    )}

                    {/* Loading Indicator */}
                    {uploading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
                            <Loader2 size={24} className="text-white animate-spin" />
                        </div>
                    )}
                </div>

                {/* Remove Button (when preview exists) */}
                {preview && !uploading && (
                    <button
                        onClick={handleRemove}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors"
                        title="Remove photo"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Info Text */}
            <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">
                    {preview ? 'Photo selected' : 'Click the camera icon to upload'}
                </p>
                <p className="text-[11px] text-gray-400">
                    JPG, PNG, or GIF • Max 5MB
                </p>
            </div>

            {/* Upload Input (hidden, triggered by hover) */}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
            />
        </div>
    );
};

export default ProfilePictureUpload;
