const editTime = require('./momentJsImitation');

test('test for a test', () => {
  expect(editTime(120)).toBe('2 minutes');
  expect(editTime(54)).toBe('54 seconds');
  expect(editTime(129)).toBe('2 minutes 9 seconds');
});