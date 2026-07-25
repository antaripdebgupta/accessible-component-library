import "@testing-library/jest-dom";
import * as jestAxeMatchers from "jest-axe";
import { expect } from "vitest";

expect.extend(jestAxeMatchers.toHaveNoViolations);
