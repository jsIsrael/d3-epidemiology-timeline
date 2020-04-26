import parse from "date-fns/parse";
export interface Event {
  description: string;
  date: Date;
}

export interface CaseNode {
  name: string;
  id: number;
  type: "Patiant" | "Flight" | "Tourist";
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

const localParse = (s: string) => parse(s, "dd.MM.yyyy", 0);

export interface Event {
  date: Date;
  description: string;
}

export const events2: Event[] = [
  {
    date: localParse("25.3.2020"),
    description:
      "אושרו תקנות חירום להגבלת הפעילות על מנת לצמצם את ההתפשטות של נגיף הקורונה בישראל",
  },
  {
    date: localParse("19.3.2020"),
    description: "שיתוף הפעולה בין משרד הבריאות וגופי הביטחון באירוע הקורונה",
  },
  {
    date: localParse("15.03.2020"),
    description:
      "הוראות משרד הבריאות המעודכנות - הפסקת פעילות כל מוסדות החינוך,\nמקומות עבודה ייערכו להמשך העברת עבודה מהבית",
  },
  {
    date: localParse("13.03.2020"),
    description:
      "הורחבה פעילות משטרת ישראל לסיוע למשרד הבריאות באכיפת הפרות צווי בידוד ואיסור התקהלות",
  },
  {
    date: localParse("11.03.2020"),
    description: "הנחיות חדשות לאוכלוסייה - לא לקיים אירועים מעל 100",
  },
  {
    date: localParse("11.03.2020"),
    description: "קריאה להמנע מכניסה לשטחי הרשות הפלשתינאית",
  },
  {
    date: localParse("10.03.2020"),
    description:
      "הנחיות חדשות - לא לקיים אירועים מעל 2,000 איש\nלהימנע מביקורים בבתי חולים ובמוסדות לקשישים.",
  },
  {
    date: localParse("10.03.2020"),
    description: "עדכון לגבי קבוצת התיירים מגרמניה",
  },
  {
    date: localParse("10.03.2020"),
    description: "דוברות שיבא: עדכון בנוגע לרופאה שנבדקה לקורונה",
  },
  {
    date: localParse("08.03.2020"),
    description: "בידוד למי שביקרו בבית לחם, בית ג'אלה ובית סחור",
  },
  {
    date: localParse("05.03.2020"),
    description: "קבוצת תיירים מיוון",
  },
  {
    date: localParse("04.03.2020"),
    description: "השקת אפליקציה למידע ותמיכה בנושא קורונה: 11 צעדים",
  },
  {
    date: localParse("26.02.2020"),
    description:
      "עדכון קורונה: אזהרת מסע לאיטליה, אמצעים למניעת הדבקה בקלפי לאדם המצוי בבידוד",
  },
  {
    date: localParse("23.02.2020"),
    description: "השעיית משלחות תלמידים לפולין נוכח התפרצות נגיף הקורונה החדש",
  },
  {
    date: localParse("22.02.2020"),
    description: "הודעה לציבור – משרד הבריאות משלחת תיירים מדרום קוריאה",
  },
  {
    date: localParse("16.02.2020"),
    description:
      "החלת בידוד בית ל-14 יום מהשהות האחרונה בתאילנד, הונג קונג, מקאו, סינגפור",
  },
  {
    date: localParse("02.02.2020"),
    description: 'מנכ"ל משרד הבריאות חתם על צו המורה על חובת בידוד',
  },
  {
    date: localParse("30.01.2020"),
    description: "סגירת מעברים יבשתיים וימיים",
  },
  {
    date: localParse("24.01.2020"),
    description: "ביצוע בדיקת מעבדה ראשונה לקורונה",
  },
];

export default a;
