import { Response, Request } from 'express';
import { HTTP_STATUS, RESPONSE_TYPES, RESPONSE_MESSAGES } from '../constants/responseConstants.js';
import { User } from "../models/User.js";
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';

interface UpdatePasswordRequest extends Request {
  body: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
}

interface UpdateProfileRequest extends Request {
  body: {
    username: string;
    phone_number: number;
  };
}

export const updatePassword = async (req: UpdatePasswordRequest, res: Response) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user_id = req.user?.user_id;
    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: RESPONSE_TYPES.ERROR,
        error:  RESPONSE_MESSAGES.AUTH.MISSING_FIELDS});
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
         error: RESPONSE_MESSAGES.AUTH.INVALID_CREDENTIALS });
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

  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: RESPONSE_TYPES.ERROR,
      message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
    });
  }
};


export const updateProfile = async (req: UpdateProfileRequest, res: Response)=>{
    try {
      const { username, phone_number } = req.body;
      const user_id = req.user?.user_id;
      // Validating input
      if (!username && !phone_number) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          status: RESPONSE_TYPES.ERROR,
          error:  RESPONSE_MESSAGES.AUTH.MISSING_FIELDS});
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
           user_id: { [Op.ne]: user_id} // exclude the current user
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
          user_id: { [Op.ne]: user_id} // exclude the current user
         } });
        if (existingUserByPhone) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            status: RESPONSE_TYPES.ERROR,
            message: RESPONSE_MESSAGES.AUTH.PHONE_NUMBER_EXISTS,
          });
        }
      }
  
      // Updating the user in the database
      if (username) user.username = username;
      if (phone_number) user.phone_number = phone_number;
      await user.save();
  
      return res.status(HTTP_STATUS.OK).json({
        status: RESPONSE_TYPES.SUCCESS,
        message: RESPONSE_MESSAGES.AUTH.PROFILE_UPDATED,
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
      });
    }
  }