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

export enum MediaType {
  Image,
  Video
}

export enum TweetAudience {
  Everyone, // 0
  TwitterCircle // 1
}

export enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet
}

export enum MediaTypeQuery {
  Image = 'image',
  Video = 'video'
}

export enum PeopleFollow {
  Anyone = '1',
  Following = '0'
}
