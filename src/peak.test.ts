import { describe, expect, test } from "bun:test"
import { fmt, isChinaHoliday, peakStatus } from "./peak"

const utc = (iso: string) => new Date(iso) // ISO with Z = UTC

describe("peak windows", () => {
  test("in peak window 1 (01:00-04:00 UTC)", () => {
    const s = peakStatus(utc("2026-02-10T02:30:00Z")) // Tue
    expect(s.peak).toBe(true)
    expect(fmt(s.ms)).toBe("01:30")
  })
  test("in peak window 2 (06:00-10:00 UTC)", () => {
    const s = peakStatus(utc("2026-02-10T09:59:00Z")) // Tue
    expect(s.peak).toBe(true)
    expect(fmt(s.ms)).toBe("00:01")
  })
  test("just before window 1", () => {
    const s = peakStatus(utc("2026-02-10T00:59:00Z")) // Tue
    expect(s.peak).toBe(false)
    expect(fmt(s.ms)).toBe("00:01")
  })
  test("between windows", () => {
    const s = peakStatus(utc("2026-02-10T05:00:00Z")) // Tue
    expect(s.peak).toBe(false)
    expect(fmt(s.ms)).toBe("01:00")
  })
  test("after last window rolls to next day", () => {
    const s = peakStatus(utc("2026-02-10T10:00:00Z")) // Tue
    expect(s.peak).toBe(false)
    expect(fmt(s.ms)).toBe("15:00") // next day 01:00
  })
  test("Friday evening rolls over the weekend to Monday", () => {
    const s = peakStatus(utc("2026-03-06T11:00:00Z")) // Fri, clean week
    expect(s.peak).toBe(false)
    expect(fmt(s.ms)).toBe("62:00") // Mon 01:00 UTC = 62h later
  })
})

describe("holidays and weekends", () => {
  test("weekend is off-peak, next peak is Monday 01:00", () => {
    const s = peakStatus(utc("2026-03-07T02:00:00Z")) // Sat, inside window hours
    expect(s.peak).toBe(false)
    expect(fmt(s.ms)).toBe("47:00") // Mon 01:00 UTC
  })
  test("Spring Festival holiday days are off-peak", () => {
    expect(isChinaHoliday(utc("2026-02-18T03:00:00Z"))).toBe(true) // Wed inside CNY
    const s = peakStatus(utc("2026-02-18T02:00:00Z")) // would-be peak hours
    expect(s.peak).toBe(false)
    expect(s.ms).toBeGreaterThan(5 * 86_400_000) // next peak after Feb 23
  })
  test("first working day after the holiday has peaks again", () => {
    const s = peakStatus(utc("2026-02-24T01:30:00Z")) // Tue after CNY
    expect(s.peak).toBe(true)
  })
  test("National Day week is off-peak", () => {
    expect(peakStatus(utc("2026-10-05T07:00:00Z")).peak).toBe(false)
  })
  test("boundaries: start inclusive, end exclusive", () => {
    expect(peakStatus(utc("2026-02-10T01:00:00Z")).peak).toBe(true)
    expect(peakStatus(utc("2026-02-10T04:00:00Z")).peak).toBe(false)
  })
  test("fmt handles multi-day spans", () => {
    expect(fmt(86_400_000 + 3_600_000)).toBe("25:00")
    expect(fmt(-1)).toBe("00:00")
  })
  test("2027 projected CNY is off-peak", () => {
    expect(peakStatus(utc("2027-02-10T02:00:00Z")).peak).toBe(false)
    expect(peakStatus(utc("2027-02-16T02:00:00Z")).peak).toBe(true) // Tue Feb 16 2027
  })
})
