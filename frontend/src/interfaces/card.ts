export interface Label {
  color: string;
  text?: string;
}

export interface CheckListItem {
  _id: string;
  subTitle: string;
  completed: boolean;
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
  checklist?: CheckListItem[];
}
