"use client";

import mitt from "mitt";

export interface ToastInfo {
  code: number;
  message: string;
}

export interface MittEvent {
  ToastError: ToastInfo;
  ToastSuccess: ToastInfo;
}
const emitter = mitt<MittEvent>();

export { emitter };
