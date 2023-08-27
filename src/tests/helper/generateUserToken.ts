import jwt from 'jsonwebtoken'

export default async (user: any) => {
  const secret = 'privateKey'
  return jwt.sign({
    id: user.id,
    name: user.name,
    type: user.type,
  }, secret);
}