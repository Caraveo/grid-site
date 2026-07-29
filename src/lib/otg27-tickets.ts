export const OTG27_DATE = "December 15, 2027";
export const OTG27_CASHTAG = "$Caraveo";
export const OTG27_BTC_ADDRESS =
  "bc1q2kvjxcqhr98vqw4yp7vfpfjtc2aj7sdr3tlw3g";

export const OTG27_TICKETS = [
  {
    id: "general",
    name: "General Admission",
    price: 300,
    marker: "01",
    description:
      "The complete OTG27 experience: keynotes, community blocks, lunch, and the closing signal.",
    includes: ["All main-stage sessions", "Community lunch", "OTG27 credential"],
  },
  {
    id: "developer",
    name: "Developer",
    price: 800,
    marker: "02",
    featured: true,
    description:
      "Go deeper with the people building GRID. Includes technical labs and the developer room.",
    includes: ["Everything in General", "Two technical labs", "Developer roundtable"],
  },
  {
    id: "student",
    name: "Student",
    price: 100,
    marker: "03",
    description:
      "A full-access community ticket for currently enrolled students. Student ID required.",
    includes: ["All main-stage sessions", "Community lunch", "Student meetup"],
  },
] as const;

export type Otg27TicketId = (typeof OTG27_TICKETS)[number]["id"];

export function getOtg27Ticket(id: string) {
  return OTG27_TICKETS.find((ticket) => ticket.id === id);
}

export function cashAppTicketUrl(amount: number, note: string) {
  const handle = OTG27_CASHTAG.replace(/^\$/, "");
  return `https://cash.app/$${handle}/${amount}?note=${encodeURIComponent(note)}`;
}
