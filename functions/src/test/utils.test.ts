import { calculatePlayTime } from "../utils";
import { getDateNowSeconds, FIXED_SYSTEM_TIME } from "./testHelpers";

describe("calculatePlayTime", () => {
  let dateNowSeconds: number;
  beforeAll(() => {
    jest.useFakeTimers("modern");
    jest.setSystemTime(FIXED_SYSTEM_TIME);
    dateNowSeconds = getDateNowSeconds();
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  // track duration of 3:15 with no resume offset
  test("with only song duration", () => {
    const [startTime, endTime] = calculatePlayTime(195);
    expect(startTime).toEqual(dateNowSeconds);
    expect(endTime).toEqual(dateNowSeconds + 195);
  });

  // track duration with a resume offset halfway through track
  test("with duration and resume offset", () => {
    const resumeDuration = 195 / 2;
    const [startTime, endTime] = calculatePlayTime(195, resumeDuration);
    expect(startTime).toEqual(dateNowSeconds - resumeDuration);
    expect(endTime).toEqual(startTime + 195);
  });
});
