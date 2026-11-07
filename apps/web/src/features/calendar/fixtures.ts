import type { CalendarEventViewModel } from './types';

export const mockCalendarEventsFixture: CalendarEventViewModel[] = [
  {
    id: 'ev-allday-1',
    title: 'Hội thảo Khoa học Sinh viên 2026',
    scope: { type: 'workspace', id: 'ws-team-alpha' },
    allDay: {
      startDate: '2026-11-10',
      endDateExclusive: '2026-11-11',
      timeZone: 'Asia/Ho_Chi_Minh',
    },
    status: 'active',
    version: 1,
  },
  {
    id: 'ev-timed-2',
    title: 'Họp giao ban tuần nhóm Alpha',
    scope: { type: 'workspace', id: 'ws-team-alpha' },
    timed: {
      startsAt: '2026-11-08T09:00:00Z',
      endsAt: '2026-11-08T10:30:00Z',
    },
    status: 'active',
    version: 1,
  },
  {
    id: 'ev-overlap-3',
    title: 'Phỏng vấn tuyển thành viên mới (Trùng giờ)',
    scope: { type: 'workspace', id: 'ws-team-alpha' },
    timed: {
      startsAt: '2026-11-08T10:00:00Z',
      endsAt: '2026-11-08T11:30:00Z',
    },
    status: 'active',
    version: 1,
    conflictWarning: true, // CAL-06
  },
  {
    id: 'ev-cancelled-4',
    title: 'Buổi hướng dẫn bù phòng Lab 302 (Đã hủy)',
    scope: { type: 'class', id: 'class-software-eng' },
    timed: {
      startsAt: '2026-11-09T07:30:00Z',
      endsAt: '2026-11-09T09:00:00Z',
    },
    status: 'cancelled', // CAL-08, CAL-11, QA-10: Visible with "Đã hủy" badge
    version: 2,
    audience: ['ws-team-alpha'],
  },
  {
    id: 'ev-private-5',
    title: 'Luyện thi chứng chỉ AWS Solutions Architect',
    scope: { type: 'private' },
    timed: {
      startsAt: '2026-11-11T13:00:00Z',
      endsAt: '2026-11-11T15:00:00Z',
    },
    status: 'active',
    version: 1,
  },
];
