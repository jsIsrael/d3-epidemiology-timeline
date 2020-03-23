export interface CaseNode {
  name: string;
  id: number;
  type: "Patiant" | "Flight";
  date: string;
  gender?: "male" | "female";
  status?: "sick" | "healthy" | "dead";
  children?: CaseNode[];
}

const a: CaseNode = {
  name: "ly292",
  id: 292,
  type: "Flight",
  date: "22/01/2020",
  children: [
    {
      name: "Patiant 411",
      id: 411,
      type: "Patiant",
      gender: "male",
      status: "sick",
      date: "26/01/2020",
      children: [
        {
          name: "Patiant 68",
          id: 68,
          type: "Patiant",
          gender: "male",
          status: "sick",
          date: "16/02/2020",
        },
        {
          name: "Patiant 396",
          id: 396,
          type: "Patiant",
          gender: "female",
          status: "sick",
          date: "16/02/2020",
        },
        {
          name: "Patiant 298",
          id: 298,
          type: "Patiant",
          gender: "male",
          status: "sick",
          date: "16/02/2020",
        },
      ],
    },
    {
      name: "Patiant 152",
      id: 152,
      type: "Patiant",
      gender: "male",
      status: "sick",
      date: "30/01/2020",
      children: [
        {
          name: "Patiant 68",
          id: 68,
          type: "Patiant",
          gender: "male",
          status: "sick",
          date: "16/02/2020",
        },
        {
          name: "Patiant 396",
          id: 396,
          type: "Patiant",
          gender: "female",
          status: "dead",
          date: "16/02/2020",
        },
        {
          name: "Patiant 314",
          id: 314,
          type: "Patiant",
          gender: "female",
          status: "healthy",
          date: "16/02/2020",
        },
        {
          name: "Patiant 196",
          id: 196,
          type: "Patiant",
          gender: "female",
          status: "sick",
          date: "16/02/2020",
        },
      ],
    },
  ],
};

export const events = [
  {
    date: new Date("2/7/2020"),
    description: "event 1",
  },

  {
    date: new Date("2/17/2020"),
    description: "event 2",
  },
];

export default a;
