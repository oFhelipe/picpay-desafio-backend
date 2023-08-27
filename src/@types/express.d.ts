declare namespace Express {
  interface Request{
      user: {
        id: number;
        email: string;
        name: string;
        password: string;
        cpf: string;
        type: $Enums.USER_TYPE;
        balance: number;
    }
  }
}
