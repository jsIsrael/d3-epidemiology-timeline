interface Node {
  id: number;
  name: string;
  description?: string;
  date: Date;
  children?: Node[];
}

const a = {
  name: "ly292",
  value: 292,
  type: "Flight",
  properties: [
    {
      date: "22/03/2020",
    },
  ],
  children: [
    {
      name: "Patiant 411",
      value: "411",
      type: "Patiant",
      properties: [{ gender: "male", status: "sick", date: "22/01/2020" }],
      children: [
        {
          name: "Patiant 68",
          value: 68,
          type: "Patiant",
          properties: [
            {
              gender: "male",
              status: "sick",
              date: "16/02/2020",
            },
          ],
        },
        {
          name: "Patiant 396",
          value: 396,
          type: "Patiant",
          properties: [
            {
              gender: "female",
              status: "sick",
              date: "16/02/2020",
            },
          ],
        },
        {
          name: "Patiant 298",
          value: 298,
          type: "Patiant",
          properties: [
            {
              gender: "hralthy",
              status: "sick",
              date: "16/02/2020",
            },
          ],
        },
      ],
    },
    {
      name: "Patiant 152",
      value: "152",
      type: "Patiant",
      properties: [
        {
          gender: "male",
          status: "sick",
          date: "22/01/2020",
        },
      ],
      children: [
        {
          name: "Patiant 68",
          value: 68,
          type: "Patiant",
          properties: [
            {
              gender: "male",
              status: "sick",
              date: "16/02/2020",
            },
          ],
        },
        {
          name: "Patiant 396",
          value: 396,
          type: "Patiant",
          properties: [
            {
              gender: "female",
              status: "sick",
              date: "16/02/2020",
            },
          ],
        },
        {
          name: "Patiant 314",
          value: 314,
          type: "Patiant",
          properties: [
            {
              gender: "female",
              status: "healthy",
              date: "16/02/2020",
            },
          ],
        },
        {
          name: "Patiant 196",
          value: 196,
          type: "Patiant",
          properties: [
            {
              gender: "female",
              status: "sick",
              date: "16/02/2020",
            },
          ],
        },
      ],
    },
  ],
};

const data: Node = {
  id: 1,
  name: "test1",
  date: new Date("2/1/2020"),
  children: [
    {
      id: 2,
      name: "2",
      date: new Date("2/5/2020"),
    },
    {
      id: 3,
      name: "3",
      date: new Date("2/4/2020"),
      children: [
        {
          id: 4,
          name: "4",
          description: "Flight no XYZ",
          date: new Date("2/8/2020"),
          children: [
            {
              id: 5,
              name: "5",
              date: new Date("2/13/2020"),
              children: [
                {
                  id: 5,
                  name: "5",
                  date: new Date("2/16/2020"),
                },
                {
                  id: 5,
                  name: "5",
                  date: new Date("2/15/2020"),
                },
              ],
            },

            {
              id: 5,
              name: "5",
              date: new Date("2/13/2020"),
            },
            {
              id: 5,
              name: "5",
              date: new Date("2/13/2020"),
            },
            {
              id: 5,
              name: "5",
              date: new Date("2/13/2020"),
            },
            {
              id: 5,
              name: "5",
              date: new Date("2/13/2020"),
            },
            {
              id: 9,
              name: "9",
              date: new Date("2/9/2020"),
              description: "Party",
              children: [
                {
                  id: 10,
                  name: "10",
                  date: new Date("2/16/2020"),
                },
              ],
            },
          ],
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

export default data;
