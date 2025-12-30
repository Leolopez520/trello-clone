export interface Card {
  _id: string;
  title: string;
  listId: string;
  boardId: string;
  description?: string;
  completed: boolean;
}
