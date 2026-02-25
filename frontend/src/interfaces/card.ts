export interface Label {
  color: string;
  text?: string;
}

export interface CheckListItem {
  _id: string;
  subTitle: string;
  completed: boolean;
}

export interface PomodoroSession {
  id: string;
  completedAt: string;
  duration: number;
}

export interface Card {
  _id: string;
  title: string;
  listId: string;
  boardId: string;
  pomodoros?: PomodoroSession[];
  pomodoroTarget?: number;
  description?: string;
  completed: boolean;
  position?: number;
  deadline?: string;
  labels?: Label[];
  checklist?: CheckListItem[];
}
