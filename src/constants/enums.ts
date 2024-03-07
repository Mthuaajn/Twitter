export enum UserVerifyStatus {
  Unverified, // chưa xác thực email, mặc định = 0
  Verified, // đã xác thực email
  Banned // bị khóa
}

export enum tokenType {
  accessToken,
  refreshToken,
  emailVerifyToken,
  forgotPasswordToken
}
