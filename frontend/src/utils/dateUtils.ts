/**
 * Helper chuẩn hóa tính toán thời hạn và trạng thái Quá Hạn (Overdue)
 * Quy tắc:
 * 1. Cùng ngày nhưng chưa quá giờ quy định -> KHÔNG tính là quá hạn (Trạng thái: TODAY / Trong hạn).
 * 2. Nếu dueDate chỉ có ngày (00:00:00) -> Hạn chót được tính đến hết ngày (23:59:59) của ngày đó.
 * 3. Chỉ khi thời gian hiện tại đã vượt qua thời điểm deadline -> Mới tính là QUÁ HẠN (OVERDUE).
 */

export interface TaskDueStatusResult {
  status: 'OVERDUE' | 'TODAY' | 'UPCOMING' | null;
  isOverdue: boolean;
  isToday: boolean;
  isUpcoming: boolean;
  label: string;
  formattedDue: string;
  hasSpecificTime: boolean;
}

export const getTaskDueStatus = (
  dueDateStr?: string | Date | null,
  isDone: boolean = false
): TaskDueStatusResult => {
  if (!dueDateStr || isDone) {
    return {
      status: null,
      isOverdue: false,
      isToday: false,
      isUpcoming: false,
      label: '',
      formattedDue: '',
      hasSpecificTime: false
    };
  }

  const due = new Date(dueDateStr);
  if (isNaN(due.getTime())) {
    return {
      status: null,
      isOverdue: false,
      isToday: false,
      isUpcoming: false,
      label: '',
      formattedDue: '',
      hasSpecificTime: false
    };
  }

  const now = new Date();

  // Kiểm tra xem có chỉ định giờ cụ thể không (khác 00:00:00.000)
  const hasSpecificTime =
    due.getHours() !== 0 || due.getMinutes() !== 0 || due.getSeconds() !== 0;

  // Nếu không có giờ cụ thể (chỉ chọn ngày), hạn chót mặc định là cuối ngày đó 23:59:59.999
  const effectiveDeadline = hasSpecificTime
    ? new Date(due.getTime())
    : new Date(due.getFullYear(), due.getMonth(), due.getDate(), 23, 59, 59, 999);

  const isOverdue = now.getTime() > effectiveDeadline.getTime();

  // Kiểm tra cùng ngày (theo ngày địa phương)
  const isSameDay =
    now.getFullYear() === due.getFullYear() &&
    now.getMonth() === due.getMonth() &&
    now.getDate() === due.getDate();

  const formattedTime = hasSpecificTime
    ? `${String(due.getHours()).padStart(2, '0')}:${String(due.getMinutes()).padStart(2, '0')}`
    : '';

  const formattedDate = `${due.getDate()}/${due.getMonth() + 1}`;
  const formattedDue = hasSpecificTime ? `${formattedDate} ${formattedTime}` : formattedDate;

  // 1. Trường hợp QUÁ HẠN
  if (isOverdue) {
    const diffMs = now.getTime() - effectiveDeadline.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let label = '';
    if (isSameDay) {
      label = diffHours > 0 ? `Trễ ${diffHours}h` : 'Vừa quá hạn';
    } else {
      label = diffDays > 0 ? `Quá hạn ${diffDays} ngày` : 'Quá hạn';
    }

    return {
      status: 'OVERDUE',
      isOverdue: true,
      isToday: isSameDay,
      isUpcoming: false,
      label,
      formattedDue,
      hasSpecificTime
    };
  }

  // 2. Trường hợp HÔM NAY (chưa quá hạn)
  if (isSameDay) {
    const label = hasSpecificTime ? `Hôm nay ${formattedTime}` : 'Hôm nay';
    return {
      status: 'TODAY',
      isOverdue: false,
      isToday: true,
      isUpcoming: false,
      label,
      formattedDue,
      hasSpecificTime
    };
  }

  // 3. Trường hợp NGÀY MAI hoặc TƯƠNG LAI
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    tomorrow.getFullYear() === due.getFullYear() &&
    tomorrow.getMonth() === due.getMonth() &&
    tomorrow.getDate() === due.getDate();

  let label = '';
  if (isTomorrow) {
    label = hasSpecificTime ? `Ngày mai ${formattedTime}` : 'Ngày mai';
  } else {
    label = formattedDue;
  }

  return {
    status: 'UPCOMING',
    isOverdue: false,
    isToday: false,
    isUpcoming: true,
    label,
    formattedDue,
    hasSpecificTime
  };
};
