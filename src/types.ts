interface LinterError {
  message: string;
  line: number;
  content: string;
}

export {
  LinterError
}
