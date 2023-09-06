export const formatBlogDateShort = (date: string | Date) => Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
}).format(new Date(date));
