export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type TaskStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: number };
  AddTask: { taskId?: number } | undefined;
};

export type AppTabsParamList = {
  TasksTab: undefined;
  Categories: undefined;
  Settings: undefined;
};
