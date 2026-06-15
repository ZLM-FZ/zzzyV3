import { findIndex as _findIndex } from "lodash";
import { _SPEC_customized_rengong } from "../../../utils/enum.js";
import { _setCnSpecification } from "../../../upload/basicConf.js";

/**
 * 做单导出：补丁/规格列根据 isPathUseEN 配置决定显示中文还是英文。
 * isPathUseEN 为 true → 显示英文 value，为 false → 显示中文 label。
 */
export function displayBdAndggCn(str) {
  if (str == null || str === "") return "";
  const s = String(str).trim();
  if (!s) return "";
  if (s === "NO" || s === "No" || s === "no") return "";

  let patchOpts = [];
  let isPathUseEN = false;
  try {
    const raw = window.localStorage.getItem("__sys4-base");
    const base = raw ? JSON.parse(raw) : {};
    patchOpts = Array.isArray(base?.patch) ? base.patch : [];
    isPathUseEN = base?.isPathUseEN === true;
  } catch {
    patchOpts = [];
  }

  const i1 = _findIndex(patchOpts, ["value", s]);
  if (i1 !== -1) {
    if (isPathUseEN) return patchOpts[i1].value || s;
    if (patchOpts[i1].label) return patchOpts[i1].label;
  }

  const i2 = _findIndex(_SPEC_customized_rengong, ["value", s]);
  if (i2 !== -1) {
    if (isPathUseEN) return _SPEC_customized_rengong[i2].value || s;
    if (_SPEC_customized_rengong[i2].label) return _SPEC_customized_rengong[i2].label;
  }

  if (!isPathUseEN) {
    const specCn = _setCnSpecification(s);
    if (specCn !== s) return specCn;
  }

  return s;
}
