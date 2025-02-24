import { HTTP_STATUS, RESPONSE_MESSAGES, RESPONSE_TYPES } from '../constants/responseConstants.js';
import { getSignedDownloadUrl, uploadToS3 } from "../services/s3Service.js";
import { Op } from 'sequelize';
import { User } from "../models/User.js";
import bcrypt from 'bcrypt';
import multer from "multer";
import path from "path";
// Configure multer for memory storage
const storage = multer.memoryStorage();
// File filter for images
const fileFilter = (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("Invalid file type. Only JPEG, JPG, PNG and GIF images are allowed."));
    }
};
// Export the upload middleware
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});
export const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const user_id = req.user?.user_id;
        // Validate input
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                status: RESPONSE_TYPES.ERROR,
                error: RESPONSE_MESSAGES.AUTH.MISSING_FIELDS
            });
        }
        // Fetching the user from the database and Checking if the user exists
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                status: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.GENERIC.NOT_FOUND,
            });
        }
        // new password and confirm password should match
        if (newPassword !== confirmPassword) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                status: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.AUTH.MISMATCHED_PASSWORDS,
            });
        }
        // Verifying current password
        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                status: RESPONSE_TYPES.ERROR,
                error: RESPONSE_MESSAGES.AUTH.INVALID_CREDENTIALS
            });
        }
        // Hashing user's new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        // Updating the password in the database
        user.password = hashedPassword;
        await user.save();
        return res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_TYPES.SUCCESS,
            message: RESPONSE_MESSAGES.AUTH.PASSWORD_UPDATED,
        });
    }
    catch (error) {
        console.error('Error updating password:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
        });
    }
};
export const updateProfile = async (req, res) => {
    try {
        const { username, phone_number } = req.body;
        const user_id = req.user?.user_id;
        const profile_image = req.file;
        // Validating input
        if (!username && !phone_number) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                status: RESPONSE_TYPES.ERROR,
                error: RESPONSE_MESSAGES.AUTH.MISSING_FIELDS
            });
        }
        // Fetching the user from the database and Checking if the user exists
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                status: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.GENERIC.NOT_FOUND,
            });
        }
        // Check if username is already taken
        if (username) {
            const existingUserByUsername = await User.findOne({ where: {
                    username,
                    user_id: { [Op.ne]: user_id } // exclude the current user
                }
            });
            if (existingUserByUsername) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    status: RESPONSE_TYPES.ERROR,
                    message: RESPONSE_MESSAGES.AUTH.USERNAME_EXISTS,
                });
            }
        }
        // Check if user exists with the same phone number
        if (phone_number) {
            const existingUserByPhone = await User.findOne({ where: {
                    phone_number,
                    user_id: { [Op.ne]: user_id } // exclude the current user
                } });
            if (existingUserByPhone) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    status: RESPONSE_TYPES.ERROR,
                    message: RESPONSE_MESSAGES.AUTH.PHONE_NUMBER_EXISTS,
                });
            }
        }
        // Upload profile image to S3 if provided
        let key = "";
        let uploadedImageUrl = "";
        let existingProfileImage = user.profile_image;
        if (profile_image) {
            const fileExtension = path.extname(profile_image.originalname);
            key = `profiles/${user_id}/${Date.now()}${fileExtension}`;
            uploadedImageUrl = await uploadToS3(profile_image, key);
        }
        // Updating the user in the database
        if (username)
            user.username = username;
        if (phone_number)
            user.phone_number = phone_number;
        if (profile_image)
            user.profile_image = existingProfileImage ? existingProfileImage : key;
        await user.save();
        return res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_TYPES.SUCCESS,
            message: RESPONSE_MESSAGES.AUTH.PROFILE_UPDATED,
            data: {
                username: user.username,
                phone_number: user.phone_number,
                profile_image: existingProfileImage ? await getSignedDownloadUrl(existingProfileImage) :
                    uploadedImageUrl ? uploadedImageUrl : null,
            },
        });
    }
    catch (error) {
        console.error('Error updating user profile:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
        });
    }
};
// GET USER PROFILE
export const getProfile = async (req, res) => {
    try {
        const user_id = req.user?.user_id;
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                status: RESPONSE_TYPES.ERROR,
                message: RESPONSE_MESSAGES.GENERIC.NOT_FOUND,
            });
        }
        return res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_TYPES.SUCCESS,
            message: RESPONSE_MESSAGES.GENERIC.FETCH_SUCCESS,
            data: {
                username: user.username,
                phone_number: user.phone_number,
                email: user.email,
                profile_image: await getSignedDownloadUrl(user.profile_image)
            },
        });
    }
    catch (error) {
        console.error('Error getting user profile:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
        });
    }
};
//# sourceMappingURL=profileController.js.map