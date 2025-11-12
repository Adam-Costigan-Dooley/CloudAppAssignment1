import { Movie, Actor, Cast, Award } from "../shared/types";

export const movies: Movie[] = [
  {
    type: "Movie",
    id: 1111,
    title: "The Shawshank Redemption",
    releaseDate: "1995-03-05",
    overview:
      "A banker convicted of uxoricide forms a friendship over a quarter century with a hardened convict …",
  },
  {
    type: "Movie",
    id: 1112,
    title: "The Godfather",
    releaseDate: "1972-03-24",
    overview:
      "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son …",
  },
];

export const actors: Actor[] = [
  {
    type: "Actor",
    id: 2111,
    name: "Morgan Freeman",
    bio:
      "Born in Memphis, Tennessee. After serving in the U.S. Air Force, he began his acting career in New York …",
    dob: "1937-06-01",
  },
  {
    type: "Actor",
    id: 2112,
    name: "Tim Robbins",
    bio: "American actor, screenwriter, director, producer, and musician.",
    dob: "1958-10-16",
  },
];

export const casts: Cast[] = [
  {
    type: "Cast",
    movieId: 1111,
    actorId: 2111,
    roleName: "Ellis Redding",
    roleDescription:
      "A contraband smuggler serving a life sentence. Red is being interviewed for parole …",
  },
  {
    type: "Cast",
    movieId: 1111,
    actorId: 2112,
    roleName: "Andy Dufresne",
    roleDescription:
      "A banker sentenced to two consecutive life terms for the murders of his wife and her lover …",
  },
];

export const awards: Award[] = [
  {
    type: "Award",
    subjectId: 1111,
    body: "Academy",
    category: "Best Movie",
    year: 1995,
  },
  {
    type: "Award",
    subjectId: 1111,
    body: "GoldenGlobe",
    category: "Best Drama",
    year: 1995,
  },
  {
    type: "Award",
    subjectId: 2111,
    body: "GoldenGlobe",
    category: "Best Supporting Actor",
    year: 1995,
  },
  {
    type: "Award",
    subjectId: 1111,
    body: "CriticsChoice",
    category: "Best Actor",
    year: 1995,
    actorId: 2111,
  },
];