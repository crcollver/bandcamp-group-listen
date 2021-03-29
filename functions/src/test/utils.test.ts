import { calculatePlayTime } from "../utils";

describe("calculatePlayTime", () => {
  let dateNowSeconds: number;
  beforeAll(() => {
    jest.useFakeTimers("modern");
    jest.setSystemTime(1616184030458);
    dateNowSeconds = Math.round(Date.now() / 1000);
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
