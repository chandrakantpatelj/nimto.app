import { z } from 'zod';
import { getPasswordSchema } from './password-schema';

export const getChangePasswordSchema = () => {
  return z
    .object({
      newPassword: getPasswordSchema(),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match.',
      path: ['confirmPassword'],
    });
};

export const getChangePasswordApiSchema = () => {
  return z.object({
    token: z.string().nonempty({
      message: 'A valid token is required to change the password.',
    }),
    newPassword: getPasswordSchema(),
  });
};
