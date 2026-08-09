import "server-only";

export {
  VallumAdmissionError,
  admissionConfiguration,
  createVallumAdmissionHandler,
  createVallumAdmissionHandler as createVallumRouteHandler,
  issueVallumAdmission,
  parseVallumAdmissionRequest,
} from "@vallum/admission";

export type {
  VallumAdmissionConfiguration,
  VallumAdmissionContext,
  VallumAdmissionHandlerOptions,
  VallumAdmissionPrincipal,
  VallumAdmissionRateLimit,
  VallumAdmissionRequest,
} from "@vallum/admission";
