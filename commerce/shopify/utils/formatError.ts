import { IRequestError } from "../hooks/types.ts";

export interface IFormattedRequestError extends IRequestError {
  formattedMessage: string;
}

const errorDictionary = {
  UNIDENTIFIED_CUSTOMER: "Email e/ou senha inválidos",
} as Record<string, string>;

const formatError = (errors: IRequestError[]): IFormattedRequestError[] => {
  return errors.map((err) => ({
    ...err,
    formattedMessage: errorDictionary[err.code] ?? err.message,
  }));
};

export default formatError;
