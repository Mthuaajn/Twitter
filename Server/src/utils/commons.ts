export const numberEnumToArray = (enumObject: { [key: string]: string | number }) => {
  return Object.values(enumObject).filter((value) => typeof value === 'number') as number[];
};
