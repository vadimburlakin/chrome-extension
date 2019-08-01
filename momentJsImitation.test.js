const editTime = require("./momentJsImitation").editTime;
const timeTypes = require("./momentJsImitation").timeTypes;


test("test for a test", () => {
  expect(editTime(120, timeTypes)).toBe("2 minutes");
  expect(editTime(54, timeTypes)).toBe("54 seconds");
  expect(editTime(129, timeTypes)).toBe("2 minutes 9 seconds");
  expect(editTime(3600, timeTypes)).toBe("1 hour");
  expect(editTime(0, timeTypes)).toBe("0 seconds");
  expect(editTime(60, timeTypes)).toBe("1 minute");
});
