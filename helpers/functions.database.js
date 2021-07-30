export const intLikeToNumber = (intLike) => {
    switch (typeof (intLike)) {
        case "object":
            return intLike.toNumber();
        case "string":
            return Number.parseInt(intLike, 10);
    }
    return intLike;
};
