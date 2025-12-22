import { AppFetch } from "./appFetch";
import type { ShellReq, BaseRes, MessageRes } from "../type";

const BASE = "/OOBE";

interface SetOobeStatusReq extends Record<string, unknown> {
    general: GeneralType[];
}
export interface GetOobeStatusReq extends Record<string, unknown> {
    Keys:string[];
}
interface GeneralType {
    Key: string;
    Value: string | boolean;
    LocalType: number;
}

type SetOobeStatusRes = Omit<MessageRes<Record<string, unknown>>, "Data"> & {
    Data: "true" | "false" | string;
};

export const setOobeStatus = (
    params: ShellReq<SetOobeStatusReq>
): BaseRes<SetOobeStatusRes> =>
    AppFetch.post(`${BASE}/SetSettings`, params);

export const getOobeStatus = (
    params: ShellReq<GetOobeStatusReq>
): BaseRes<SetOobeStatusRes> =>
    AppFetch.post(`${BASE}/GetSettings`, params);
export const startOobe = (
    params: ShellReq<string>
): BaseRes<SetOobeStatusRes> =>
    AppFetch.post(`${BASE}/Start`, params);

export const setLogin = (
    params: ShellReq<string>
): BaseRes<SetOobeStatusRes> =>
    AppFetch.post(`${BASE}/Login`, params);