import { faker } from "@faker-js/faker"
import { prismaClient } from "../../database/prismaClient"
import { $Enums } from "@prisma/client";

type CreateUserHelperProps = Partial<{
  id: number;
  email: string;
  name: string;
  password: string;
  cpf: string;
  type: $Enums.USER_TYPE;
  balance: number;
}>

export default async (user?: CreateUserHelperProps) => {
  return await prismaClient.user.create({
    data: {
      name: faker.person.firstName(),
      password: faker.internet.password(),
      cpf: faker.number.bigInt({ min: 11111111111, max:99999999999 }).toString(),
      email: faker.internet.email(),
      balance: 100,
      ...user,
    },
  })
}