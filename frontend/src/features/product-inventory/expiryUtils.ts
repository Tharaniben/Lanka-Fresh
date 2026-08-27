export interface ExpiryStatus {
  isExpired: boolean;
  isExpiringSoon: boolean;
  daysRemaining: number | null;
  formattedDate: string | null;
  label: string | null;
}

/**
 * Calculates whether a product is expired, expiring soon (<= 7 days), or healthy.
 */
export function getExpiryStatus(expiryDateStr: string | null | undefined): ExpiryStatus {
  if (!expiryDateStr) {
    return {
      isExpired: false,
      isExpiringSoon: false,
      daysRemaining: null,
      formattedDate: null,
      label: null,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parts = expiryDateStr.split("-").map(Number);
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return {
      isExpired: false,
      isExpiringSoon: false,
      daysRemaining: null,
      formattedDate: expiryDateStr,
      label: null,
    };
  }

  const [year, month, day] = parts;
  const expiry = new Date(year, month - 1, day);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isExpired = daysRemaining < 0;
  const isExpiringSoon = !isExpired && daysRemaining <= 7;

  let label = null;
  if (isExpired) {
    label = "Expired";
  } else if (daysRemaining === 0) {
    label = "Expires today";
  } else if (daysRemaining === 1) {
    label = "Expires tomorrow";
  } else if (isExpiringSoon) {
    label = `Expires in ${daysRemaining} days`;
  }

  return {
    isExpired,
    isExpiringSoon,
    daysRemaining,
    formattedDate: expiry.toLocaleDateString(),
    label,
  };
}
