import { marshall } from "@aws-sdk/util-dynamodb";
import { Movie, Actor, Cast, Award } from "./types";

type Entity = Movie | Actor | Cast | Award;

export const toItem = (e: Entity) => {
  switch (e.type) {
    case "Movie":
      return {
        pk: `m${e.id}`,
        sk: "xxxx",
        ...e,
      };
    case "Actor":
      return {
        pk: `a${e.id}`,
        sk: "xxxx",
        ...e,
      };
    case "Cast":
      return {
        pk: `c${e.movieId}`,
        sk: `${e.actorId}`,
        ...e,
      };
    case "Award":
      return {
        pk: `w${e.subjectId}`,
        sk: e.body,
        ...e,
      };
  }
};

export const generateItem = (e: Entity) => ({
  PutRequest: { Item: marshall(toItem(e)) },
});

export const generateBatch = (data: Entity[]) => data.map(generateItem);
