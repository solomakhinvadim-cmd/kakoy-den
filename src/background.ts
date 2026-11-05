import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { rescheduleAll } from './notifications';
import { loadSettings } from './storage';

// Раз в ~12 часов система будит приложение в фоне, и оно продлевает
// расписание уведомлений, даже если его давно не открывали.
const TASK = 'kakoy-den-reschedule';

TaskManager.defineTask(TASK, async () => {
  try {
    await rescheduleAll(await loadSettings());
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export async function registerBackground(): Promise<void> {
  try {
    const status = await BackgroundTask.getStatusAsync();
    if (status !== BackgroundTask.BackgroundTaskStatus.Available) return;
    if (!(await TaskManager.isTaskRegisteredAsync(TASK))) {
      await BackgroundTask.registerTaskAsync(TASK, { minimumInterval: 12 * 60 });
    }
  } catch {
    // фон недоступен — расписание всё равно продлится при открытии приложения
  }
}
