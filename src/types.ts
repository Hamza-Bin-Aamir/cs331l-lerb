export type Resource = {
  id: string;
  name: string;
  emoji: string;
  bookedBy?: string; // undefined => Available
  category?: string;
};
