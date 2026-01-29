export const generateId = (): string => {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substr(2, 9);
  return `task_${timestamp}_${randomSuffix}`;
};
