export type FileUploadRules = {
  accept: readonly string[];
  maxSizeBytes: number;
  requiredMessage?: string;
  typeMessage?: string;
  sizeMessage?: string;
};

export function normalizeMimeType(type: string) {
  if (type === "image/jpg") return "image/jpeg";
  return type;
}

export function isAllowedMimeType(type: string, accept: readonly string[]) {
  const normalized = normalizeMimeType(type);
  return accept.some((item) => normalizeMimeType(item) === normalized);
}

export function formatAccept(accept: readonly string[]) {
  return accept.join(",");
}

export function formatMaxSizeLabel(maxSizeBytes: number) {
  if (maxSizeBytes < 1024 * 1024) {
    return `${Math.round(maxSizeBytes / 1024)}KB`;
  }
  return `${Math.round(maxSizeBytes / (1024 * 1024))}MB`;
}

export function fileHelperText(rules: FileUploadRules) {
  const labels = rules.accept.map((type) => {
    if (type === "image/jpeg") return "JPG";
    if (type === "image/png") return "PNG";
    if (type === "application/pdf") return "PDF";
    return type.split("/").pop()?.toUpperCase() ?? type;
  });
  const unique = [...new Set(labels)];
  return `${unique.join(", ")} up to ${formatMaxSizeLabel(rules.maxSizeBytes)}`;
}

export function validateFile(
  file: File | null,
  rules: FileUploadRules,
): string | null {
  if (!(file instanceof File)) {
    return rules.requiredMessage ?? "Select a file to continue.";
  }

  if (file.size <= 0 || file.size > rules.maxSizeBytes) {
    return (
      rules.sizeMessage ??
      `File must be ${formatMaxSizeLabel(rules.maxSizeBytes)} or less.`
    );
  }

  if (!isAllowedMimeType(file.type, rules.accept)) {
    return rules.typeMessage ?? `Use ${fileHelperText(rules)}.`;
  }

  return null;
}

export function createFileValidator(rules: FileUploadRules) {
  return (file: File | null) => validateFile(file, rules);
}

export const PAYMENT_PROOF_UPLOAD = {
  accept: ["image/jpeg", "image/png", "application/pdf"],
  maxSizeBytes: 10 * 1024 * 1024,
  requiredMessage: "Upload a payment proof to continue.",
  typeMessage: "Use a PNG, JPG, or PDF.",
  sizeMessage: "File must be 10MB or less.",
} as const satisfies FileUploadRules;
