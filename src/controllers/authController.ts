import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { HTTP_STATUS, RESPONSE_MESSAGES, RESPONSE_TYPES } from '../constants/responseConstants.js';
import { User } from '../models/User.js';

interface AuthRequest extends Request {
  body: {
    username: string;
    email?: string;
    password: string;
    phone_number?: number;
  };
}

export const login = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    console.log('Login attempt for email:', req.body.email);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing required fields');
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.AUTH.MISSING_CREDENTIALS
      });
    }

    console.log('Querying database for user');
    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      console.log('No user found with email:', email);
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.AUTH.INVALID_CREDENTIALS
      });
    }

    console.log('User found, verifying password');
    if (!user.password) {
      console.log('No password hash found for user:', email);
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.AUTH.INVALID_CREDENTIALS
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password verification result:', validPassword);

    if (!validPassword) {
      console.log('Invalid password for user:', email);
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: RESPONSE_TYPES.ERROR,
        message: RESPONSE_MESSAGES.AUTH.INVALID_CREDENTIALS
      });
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('Login successful for user:', email);
    return res.status(HTTP_STATUS.OK).json({
      status: RESPONSE_TYPES.SUCCESS,
      message: RESPONSE_MESSAGES.AUTH.LOGIN_SUCCESS,
      data: { token }
    });
  } catch (error: unknown) {
    console.error('Error in login:', error);
    console.error('Error details:', error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : 'Unknown error structure');
    
    if (error instanceof Error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: RESPONSE_TYPES.ERROR,
        message: error.message || RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR
      });
    }
    
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: RESPONSE_TYPES.ERROR,
      message: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR
    });
  }
};

export const register = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    console.log('Registration attempt with email:', req.body.email);
    const { username, email, password, phone_number } = req.body;

    // Validate required fields
    if (!username || !password) {
      console.log('Missing required fields');
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: "Username and password are required"
      });
    }

    // Validate that either email or phone_number is provided
    if (!email && !phone_number) {
      console.log('Missing required fields');
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: "Either email or phone number is required"
      });
    }

    // Check if user exists with the same email
    if (email) {
      const existingUserByEmail = await User.findOne({ where: { email } });
      if (existingUserByEmail) {
        console.log('User already exists with email:', email);
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: "User with this email already exists"
        });
      }
    }

    // Check if user exists with the same phone number
    if (phone_number) {
      const existingUserByPhone = await User.findOne({ where: { phone_number } });
      if (existingUserByPhone) {
        console.log('User already exists with phone number:', phone_number);
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: "User with this phone number already exists"
        });
      }
    }

    // Check if username is already taken
    const existingUserByUsername = await User.findOne({ where: { username } });
    if (existingUserByUsername) {
      console.log('User already exists with username:', username);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: "Username is already taken"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      phone_number
    });

    console.log('Registration successful for user:', username);
    return res.status(HTTP_STATUS.CREATED).json({
      message: "User registered successfully",
      user_id: user.user_id,
      email: user.email
    });

  } catch (error: unknown) {
    console.error('Error in register:', error);
    console.error('Error details:', error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : 'Unknown error structure');
    
    if (error instanceof Error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: error.message || RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR
      });
    }
    
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: RESPONSE_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR
    });
  }
};
