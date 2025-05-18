import * as bcrypt from 'bcrypt';

export const hashPassword = (password: string) => {
  return bcrypt.hash(password, 12);
};

export const comparePassword = (password: string, hashedPassword: string) => {
  return bcrypt.compare(password, hashedPassword);
};
