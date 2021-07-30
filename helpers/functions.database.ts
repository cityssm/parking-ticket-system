import type { IntLike } from "integer";


export const intLikeToNumber = (intLike: IntLike): number => {

  switch (typeof (intLike)) {

    case "object":
      return intLike.toNumber();

    case "string":
      return Number.parseInt(intLike, 10);
  }

  return intLike;
};
