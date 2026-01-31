export interface Label {
  color: string;
  text?: string;
}

export interface Card {
  _id: string;
  title: string;
  listId: string;
  boardId: string;
  description?: string;
  completed: boolean;
  position?: number;
  deadline?: string;
  labels?: Label[];
}
